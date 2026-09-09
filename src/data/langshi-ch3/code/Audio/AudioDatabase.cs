using UnityEngine;
using System.Collections.Generic;

/// <summary>
/// 音效数据库
/// 用于存储所有音效，并通过 key 快速查找
/// </summary>
[CreateAssetMenu(menuName = "Audio/Audio Database")]
public class AudioDatabase : ScriptableObject
{
    [Header("音效列表")]
    [Tooltip("在这里添加所有音效")]
    public List<AudioCue> cues = new();

    /// <summary>
    /// 内部字典，用于快速查找
    /// key = 音效名字
    /// value = 音效数据
    /// </summary>
    private Dictionary<string, AudioCue> cueDictionary;

    /// <summary>
    /// 构建字典（启动时调用）
    /// </summary>
    public void Build()
    {
        cueDictionary = new Dictionary<string, AudioCue>();

        foreach (var cue in cues)
        {
            // 跳过空数据
            if (cue == null)
                continue;

            // 跳过空key
            if (string.IsNullOrWhiteSpace(cue.key))
                continue;

            // 防止重复key
            if (cueDictionary.ContainsKey(cue.key))
            {
                Debug.LogWarning("AudioDatabase: 发现重复key: " + cue.key);
                continue;
            }

            // 添加到字典
            cueDictionary.Add(cue.key, cue);
        }
    }

    /// <summary>
    /// 根据key查找音效
    /// </summary>
    public bool TryGetCue(string key, out AudioCue cue)
    {
        // 如果字典还没构建，先构建
        if (cueDictionary == null)
        {
            Build();
        }

        // 尝试获取
        return cueDictionary.TryGetValue(key, out cue);
    }
}
