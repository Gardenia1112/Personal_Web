using UnityEngine;
using UnityEngine.SceneManagement;
using System.Collections.Generic;

/// <summary>
/// 根据场景名自动播放 BGM
/// 用法：挂到任意物体上（推荐挂到 AudioManager 同一个物体上）
/// </summary>
public class BgmByScene : MonoBehaviour
{
    [System.Serializable]
    public class SceneBgm
    {
        [Tooltip("场景名字（Build Settings 里那个 Scene 名）")]
        public string sceneName;

        [Tooltip("AudioDatabase 里的 BGM key，例如 bgm_menu")]
        public string bgmKey;
    }

    [Header("场景 -> BGM 对应表")]
    public List<SceneBgm> mappings = new List<SceneBgm>();

    [Header("淡入淡出时间")]
    public float fadeTime = 1.0f;

    [Header("如果同一首歌就不重复播放")]
    public bool dontRestartSameBgm = true;

    private string currentBgmKey = null;
    private Dictionary<string, string> mapDict;

    private void Awake()
    {
        // 把 list 转成字典，查找更快
        mapDict = new Dictionary<string, string>();
        foreach (var m in mappings)
        {
            if (m == null) continue;
            if (string.IsNullOrWhiteSpace(m.sceneName)) continue;
            if (string.IsNullOrWhiteSpace(m.bgmKey)) continue;

            if (!mapDict.ContainsKey(m.sceneName))
                mapDict.Add(m.sceneName, m.bgmKey);
        }
    }

    private void OnEnable()
    {
        SceneManager.sceneLoaded += OnSceneLoaded;
    }

    private void OnDisable()
    {
        SceneManager.sceneLoaded -= OnSceneLoaded;
    }

    private void Start()
    {
        // 游戏启动时，手动触发一次当前场景
        OnSceneLoaded(SceneManager.GetActiveScene(), LoadSceneMode.Single);
    }

    private void OnSceneLoaded(Scene scene, LoadSceneMode mode)
    {
        if (AudioManager.I == null) return;

        if (mapDict != null && mapDict.TryGetValue(scene.name, out var bgmKey))
        {
            if (dontRestartSameBgm && currentBgmKey == bgmKey)
                return;

            currentBgmKey = bgmKey;
            AudioManager.I.PlayMusic(bgmKey, fadeTime);
        }
        else
        {
            // 如果这个场景没配置BGM，你可以选择：不做事 / 停止音乐
            // AudioManager.I.StopMusic(fadeTime);
        }
    }
}
