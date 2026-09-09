using UnityEngine;
using UnityEngine.Audio;
using System.Collections;
using System.Collections.Generic;

/// <summary>
/// 音频管理器（全局单例）
/// 功能：
/// 1) 播放音效（2D/3D/指定位置）
/// 2) 播放背景音乐（双AudioSource交叉淡入淡出）
/// 3) 对象池复用AudioSource（避免频繁创建销毁造成卡顿）
/// 4) 通过 AudioMixer 的 Exposed Parameters 控制 Master/BGM/SFX/UI/Ambience 音量
/// 5) 音量与静音保存（PlayerPrefs）
/// </summary>
public class AudioManager : MonoBehaviour
{
    public static AudioManager I { get; private set; }

    [Header("音效数据库（AudioDatabase.asset）")]
    public AudioDatabase database;

    [Header("AudioMixer（MasterMixer.mixer）")]
    public AudioMixer mixer;

    [Header("Mixer分组输出（把 Mixer 的 Group 拖进来）")]
    public AudioMixerGroup bgmGroup;
    public AudioMixerGroup sfxGroup;
    public AudioMixerGroup uiGroup;
    public AudioMixerGroup ambienceGroup;

    [Header("对象池预热数量（可按项目规模调整）")]
    public int sfxPrewarm = 16;
    public int uiPrewarm = 8;
    public int ambiencePrewarm = 8;

    [Header("默认冷却（防止同音效按钮被疯狂触发）")]
    [Tooltip("如果你不想限制，可以填 0")]
    public float defaultSfxCooldown = 0.03f;

    // -----------------------------
    // 对象池（SFX / UI / 环境音）
    // -----------------------------
    private readonly Queue<AudioSource> sfxPool = new();
    private readonly Queue<AudioSource> uiPool = new();
    private readonly Queue<AudioSource> ambiencePool = new();

    // -----------------------------
    // BGM 双源交叉淡入淡出
    // -----------------------------
    private AudioSource bgmA;
    private AudioSource bgmB;
    private bool usingA = true;
    private Coroutine bgmFadeCo;

    // -----------------------------
    // 限制与记录（冷却 & 同时播放计数）
    // -----------------------------
    private readonly Dictionary<string, float> lastPlayTime = new(); // key -> 上次播放时间
    private readonly Dictionary<string, int> playingCount = new();   // key -> 当前同时播放数量

    // -----------------------------
    // Unity 生命周期
    // -----------------------------
    private void Awake()
    {
        // 单例
        if (I != null)
        {
            Destroy(gameObject);
            return;
        }
        I = this;
        DontDestroyOnLoad(gameObject);

        // 构建数据库字典
        if (database != null)
            database.Build();

        // 创建根节点，保持层级清爽
        var root = new GameObject("AudioRoot").transform;
        root.SetParent(transform);

        // 创建 BGM 双源（2D）
        bgmA = CreateSource(root, "BGM_A", bgmGroup, is3D: false);
        bgmB = CreateSource(root, "BGM_B", bgmGroup, is3D: false);
        bgmA.loop = true;
        bgmB.loop = true;

        // 预热对象池（SFX/UI/环境）
        PrewarmPool(root, sfxPool, sfxPrewarm, "SFX_Pooled", sfxGroup, is3D: false);
        PrewarmPool(root, uiPool, uiPrewarm, "UI_Pooled", uiGroup, is3D: false);
        PrewarmPool(root, ambiencePool, ambiencePrewarm, "AMB_Pooled", ambienceGroup, is3D: true);

        // 启动时应用保存的音量设置
        ApplySavedMixerVolumes();
    }

    // -----------------------------
    // 公共 API：播放
    // -----------------------------

    /// <summary>
    /// 播放 2D 音效（默认走 SFX 分组，实际分组由数据库 cue.bus 决定）
    /// </summary>
    public void PlaySfx(string key, float volumeMul = 1f, float? cooldownOverride = null)
    {
        PlayInternal(key, Vector3.zero, is3D: false, volumeMul: volumeMul, cooldownOverride: cooldownOverride);
    }

    /// <summary>
    /// 播放 3D 音效（指定世界坐标位置）
    /// </summary>
    public void PlaySfxAt(string key, Vector3 worldPos, float volumeMul = 1f, float? cooldownOverride = null)
    {
        PlayInternal(key, worldPos, is3D: true, volumeMul: volumeMul, cooldownOverride: cooldownOverride);
    }

    /// <summary>
    /// 播放背景音乐（BGM），带淡入淡出
    /// 约定：BGM cue 一般 clips 只放 1 个（也可以多个随机）
    /// </summary>
    public void PlayMusic(string key, float fadeTime = 1.0f, bool loop = true)
    {
        if (!TryGetCue(key, out var cue)) return;

        // 选 clip（BGM允许多个随机）
        var clip = PickClip(cue);
        if (clip == null) return;

        // 选择当前与下一个 BGM Source
        var next = usingA ? bgmB : bgmA;
        var cur = usingA ? bgmA : bgmB;

        next.outputAudioMixerGroup = bgmGroup;
        next.clip = clip;
        next.loop = loop;
        next.pitch = 1f;
        next.volume = 0f;
        next.Play();

        // 交叉淡入淡出
        if (bgmFadeCo != null) StopCoroutine(bgmFadeCo);
        bgmFadeCo = StartCoroutine(CrossFade(cur, next, fadeTime, cue.volume));

        usingA = !usingA;
    }

    /// <summary>
    /// 停止背景音乐（淡出停止）
    /// </summary>
    public void StopMusic(float fadeTime = 0.6f)
    {
        var cur = usingA ? bgmB : bgmA; // usingA 已经在上次 PlayMusic 里切换过
        if (bgmFadeCo != null) StopCoroutine(bgmFadeCo);
        bgmFadeCo = StartCoroutine(FadeOutAndStop(cur, fadeTime));
    }

    // -----------------------------
    // 公共 API：音量/静音（保存+应用Mixer）
    // -----------------------------

    public void SetMasterVolume(float v)
    {
        AudioSettingsSave.SetMaster(v);
        ApplySavedMixerVolumes();
        AudioSettingsSave.Save();
    }

    public void SetBgmVolume(float v)
    {
        AudioSettingsSave.SetBgm(v);
        ApplySavedMixerVolumes();
        AudioSettingsSave.Save();
    }

    public void SetSfxVolume(float v)
    {
        AudioSettingsSave.SetSfx(v);
        ApplySavedMixerVolumes();
        AudioSettingsSave.Save();
    }

    public void SetUiVolume(float v)
    {
        AudioSettingsSave.SetUi(v);
        ApplySavedMixerVolumes();
        AudioSettingsSave.Save();
    }

    public void SetAmbienceVolume(float v)
    {
        AudioSettingsSave.SetAmb(v);
        ApplySavedMixerVolumes();
        AudioSettingsSave.Save();
    }

    public void SetMute(bool mute)
    {
        AudioSettingsSave.SetMute(mute);
        ApplySavedMixerVolumes();
        AudioSettingsSave.Save();
    }

    // -----------------------------
    // 核心：播放内部逻辑
    // -----------------------------
    private void PlayInternal(string key, Vector3 pos, bool is3D, float volumeMul, float? cooldownOverride)
    {
        if (!TryGetCue(key, out var cue)) return;

        // 冷却：优先使用 override，否则用默认冷却
        float cooldown = cooldownOverride.HasValue ? cooldownOverride.Value : defaultSfxCooldown;
        if (!PassCooldownAndLimit(cue, cooldown)) return;

        // 选 clip
        var clip = PickClip(cue);
        if (clip == null) return;

        // 根据 bus 决定用哪个池、哪个 mixer group
        var pool = GetPoolByBus(cue.bus, out var group, out bool default3D);

        // 取 AudioSource（对象池）
        var src = GetFromPool(pool, group, is3D || default3D);

        // 设置位置（2D无所谓，3D需要）
        src.transform.position = pos;

        // 设置2D/3D（若 cue 属于 Ambience 默认3D；否则按调用者 is3D）
        src.spatialBlend = (is3D || default3D) ? 1f : 0f;

        // 配置基本属性
        src.clip = clip;
        src.loop = cue.loop;
        src.pitch = Random.Range(cue.pitchMin, cue.pitchMax);
        src.volume = Mathf.Clamp01(cue.volume * volumeMul);

        // 播放
        src.gameObject.SetActive(true);
        src.Play();

        // 记录同时播放数
        IncPlaying(key);

        // 非循环：播放完归还
        if (!cue.loop)
            StartCoroutine(ReleaseWhenDone(key, src, pool));
        // 循环音效：你可以后续扩展 StopSfx(key) 去停
    }

    // -----------------------------
    // 对象池相关
    // -----------------------------

    /// <summary>
    /// 预热池子：提前创建 AudioSource
    /// </summary>
    private void PrewarmPool(Transform root, Queue<AudioSource> pool, int count, string name, AudioMixerGroup group, bool is3D)
    {
        for (int i = 0; i < count; i++)
        {
            var src = CreateSource(root, name, group, is3D);
            src.gameObject.SetActive(false);
            pool.Enqueue(src);
        }
    }

    /// <summary>
    /// 创建一个 AudioSource
    /// </summary>
    private AudioSource CreateSource(Transform parent, string name, AudioMixerGroup group, bool is3D)
    {
        var go = new GameObject(name);
        go.transform.SetParent(parent);

        var src = go.AddComponent<AudioSource>();
        src.playOnAwake = false;
        src.outputAudioMixerGroup = group;

        // 0=2D，1=3D
        src.spatialBlend = is3D ? 1f : 0f;
        src.rolloffMode = AudioRolloffMode.Logarithmic;

        return src;
    }

    /// <summary>
    /// 按 bus 返回对应池子，同时返回应该输出到哪个 mixer group
    /// default3D：这个 bus 默认是否 3D（环境音一般默认 3D）
    /// </summary>
    private Queue<AudioSource> GetPoolByBus(AudioBus bus, out AudioMixerGroup group, out bool default3D)
    {
        default3D = false;

        switch (bus)
        {
            case AudioBus.UI:
                group = uiGroup != null ? uiGroup : sfxGroup;
                return uiPool;

            case AudioBus.Ambience:
                group = ambienceGroup != null ? ambienceGroup : sfxGroup;
                default3D = true;
                return ambiencePool;

            case AudioBus.BGM:
                // BGM 不走对象池，BGM 用专用 bgmA/bgmB
                group = bgmGroup;
                return sfxPool;

            default:
                group = sfxGroup;
                return sfxPool;
        }
    }

    /// <summary>
    /// 从池子拿 AudioSource（池子空了就创建一个）
    /// </summary>
    private AudioSource GetFromPool(Queue<AudioSource> pool, AudioMixerGroup group, bool is3D)
    {
        AudioSource src;
        if (pool.Count > 0)
        {
            src = pool.Dequeue();
        }
        else
        {
            // 池子不够就动态创建（尽量别太频繁）
            src = CreateSource(transform, "PooledAudio_Extra", group, is3D);
        }

        // 每次拿出来都更新输出组与2D/3D设置，避免上次残留
        src.outputAudioMixerGroup = group;
        src.spatialBlend = is3D ? 1f : 0f;

        return src;
    }

    /// <summary>
    /// 播放完毕后归还池子
    /// </summary>
    private IEnumerator ReleaseWhenDone(string key, AudioSource src, Queue<AudioSource> pool)
    {
        if (src == null) yield break;

        yield return new WaitWhile(() => src != null && src.isPlaying);

        // 播放计数减少
        DecPlaying(key);

        // 清理并归还
        src.Stop();
        src.clip = null;
        src.loop = false;
        src.transform.localPosition = Vector3.zero;

        src.gameObject.SetActive(false);
        pool.Enqueue(src);
    }

    // -----------------------------
    // 数据库与限制
    // -----------------------------

    private bool TryGetCue(string key, out AudioCue cue)
    {
        cue = null;

        if (database == null)
        {
            Debug.LogWarning("[AudioManager] 没有绑定 AudioDatabase.asset");
            return false;
        }

        if (!database.TryGetCue(key, out cue))
        {
            Debug.LogWarning("[AudioManager] 找不到音效 key: " + key);
            return false;
        }

        return true;
    }

    /// <summary>
    /// 随机选一个音频
    /// </summary>
    private AudioClip PickClip(AudioCue cue)
    {
        if (cue.clips == null || cue.clips.Length == 0) return null;
        return cue.clips[Random.Range(0, cue.clips.Length)];
    }

    /// <summary>
    /// 冷却 + 同时播放上限
    /// 注意：AudioCue 里如果你还没加 cooldown/maxSimultaneous，这里也能用默认值
    /// </summary>
    private bool PassCooldownAndLimit(AudioCue cue, float cooldown)
    {
        float now = Time.unscaledTime;

        // 冷却：key 在 cooldown 时间内重复触发则忽略
        if (cooldown > 0f)
        {
            if (lastPlayTime.TryGetValue(cue.key, out var last) && now - last < cooldown)
                return false;

            lastPlayTime[cue.key] = now;
        }

        // 同时播放上限：如果 cue.maxSimultaneous <=0 视为不限
        if (cue.maxSimultaneous > 0)
        {
            playingCount.TryGetValue(cue.key, out int cnt);
            if (cnt >= cue.maxSimultaneous)
                return false;
        }

        return true;
    }

    private void IncPlaying(string key)
    {
        playingCount.TryGetValue(key, out int cnt);
        playingCount[key] = cnt + 1;
    }

    private void DecPlaying(string key)
    {
        if (!playingCount.TryGetValue(key, out int cnt)) return;
        cnt--;
        if (cnt <= 0) playingCount.Remove(key);
        else playingCount[key] = cnt;
    }

    // -----------------------------
    // BGM 淡入淡出
    // -----------------------------
    private IEnumerator CrossFade(AudioSource from, AudioSource to, float time, float targetToVol)
    {
        float t = 0f;
        float fromStart = from != null ? from.volume : 0f;

        while (t < time)
        {
            t += Time.unscaledDeltaTime;
            float k = Mathf.Clamp01(t / time);

            if (from != null) from.volume = Mathf.Lerp(fromStart, 0f, k);
            if (to != null) to.volume = Mathf.Lerp(0f, targetToVol, k);

            yield return null;
        }

        if (from != null)
        {
            from.Stop();
            from.volume = 0f;
        }
        if (to != null)
        {
            to.volume = targetToVol;
        }
    }

    private IEnumerator FadeOutAndStop(AudioSource src, float time)
    {
        if (src == null) yield break;

        float t = 0f;
        float start = src.volume;

        while (t < time)
        {
            t += Time.unscaledDeltaTime;
            float k = Mathf.Clamp01(t / time);
            src.volume = Mathf.Lerp(start, 0f, k);
            yield return null;
        }

        src.Stop();
        src.volume = 0f;
    }

    // -----------------------------
    // Mixer 音量应用（Exposed Parameters）
    // -----------------------------

    /// <summary>
    /// 线性音量(0~1) 转 dB（用于 AudioMixer）
    /// 1 -> 0dB，接近0 -> 很小的负dB（相当于静音）
    /// </summary>
    private float LinearToDb(float v)
    {
        v = Mathf.Clamp(v, 0.0001f, 1f);
        return Mathf.Log10(v) * 20f;
    }

    /// <summary>
    /// 把保存的音量应用到 Mixer
    /// 参数名必须与 Mixer 的 Exposed Parameters 一致
    /// </summary>
    private void ApplySavedMixerVolumes()
    {
        if (mixer == null) return;

        // 静音：把 Master 视作 0
        float masterLinear = AudioSettingsSave.Mute ? 0f : AudioSettingsSave.Master;

        mixer.SetFloat("MasterVol", LinearToDb(masterLinear));
        mixer.SetFloat("BgmVol", LinearToDb(AudioSettingsSave.Bgm));
        mixer.SetFloat("SfxVol", LinearToDb(AudioSettingsSave.Sfx));
        mixer.SetFloat("UiVol", LinearToDb(AudioSettingsSave.Ui));
        mixer.SetFloat("AmbienceVol", LinearToDb(AudioSettingsSave.Amb));
    }
}
