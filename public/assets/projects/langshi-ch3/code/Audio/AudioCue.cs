using UnityEngine;

/// <summary>
/// 音效所属的音频分组
/// </summary>
public enum AudioBus
{
    BGM,        // 背景音乐
    SFX,        // 普通音效
    UI,         // UI音效
    Ambience    // 环境音
}

/// <summary>
/// 单个音效/音乐的配置数据
/// </summary>
[System.Serializable]
public class AudioCue
{
    [Header("唯一标识符")]
    public string key;

    [Header("音频分组")]
    public AudioBus bus = AudioBus.SFX;

    [Header("音频文件（可多个随机）")]
    public AudioClip[] clips;

    [Header("音量")]
    [Range(0f, 1f)]
    public float volume = 1f;

    [Header("随机音高（让同音效更自然）")]
    [Range(0.1f, 3f)] public float pitchMin = 1f;
    [Range(0.1f, 3f)] public float pitchMax = 1f;

    [Header("是否循环")]
    public bool loop = false;

    [Header("同时播放上限（<=0 表示不限制）")]
    public int maxSimultaneous = 8;
}
