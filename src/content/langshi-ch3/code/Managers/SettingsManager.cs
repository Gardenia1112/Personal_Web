using System;
using UnityEditor;
using UnityEngine;

// 设置数据类
[System.Serializable]
public class GameSettingsData
{
    // 音频设置
    public float masterVolume = 1.0f;
    public float musicVolume = 1.0f;
    public float sfxVolume = 1.0f;
    public bool musicEnabled = true;
    public bool sfxEnabled = true;

    // 操作设置（根据你策划稿的8个按键）
    public KeyCode moveForwardKey = KeyCode.W;
    public KeyCode moveBackKey = KeyCode.S;
    public KeyCode moveLeftKey = KeyCode.A;
    public KeyCode moveRightKey = KeyCode.D;
    public KeyCode jumpKey = KeyCode.Space;
    public KeyCode interactKey = KeyCode.E;
    public KeyCode skillKey = KeyCode.Q;
    public KeyCode likeKey = KeyCode.F;

    // 画面设置
    public int resolutionIndex = 5;
    public Vector2Int resolution = new Vector2Int(1920, 1080);
    public readonly Vector2Int[] resolutions = new Vector2Int[]
    {
        new(800, 600),
        new(1024, 768),
        new(1280, 720),  // HD
        new(1366, 768),
        new(1600, 900),
        new(1920, 1080), // Full HD
        new(2560, 1440)
    };

    public int qualityLevel = 2; // 中画质
    public bool isFullscreen = true;
    public float brightness = 0.8f;
}

// 核心设置管理器
public class SettingsManager : MonoBehaviour
{
    public static SettingsManager Instance { get; private set; }

    // 当前设置数据
    private GameSettingsData _currentSettings;

    // 事件定义（用于实时通知其他系统）
    public event Action OnSettingsChanged;
    public event Action<float> OnMasterVolumeChanged;
    public event Action<KeyCode, string> OnKeyBindingChanged;

    // 保存的键名
    private const string SETTINGS_SAVE_KEY = "GameSettings_V1";

    void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }

        Instance = this;
        DontDestroyOnLoad(gameObject);
        LoadSettings();
    }

    #region 公开接口 - 供水门汀在UI中调用

    // 音频设置属性
    public float MasterVolume
    {
        get => _currentSettings.masterVolume;
        set
        {
            _currentSettings.masterVolume = Mathf.Clamp01(value);
            SaveSettings();
            OnMasterVolumeChanged?.Invoke(_currentSettings.masterVolume);
            OnSettingsChanged?.Invoke();
        }
    }

    public float MusicVolume
    {
        get => _currentSettings.musicVolume;
        set
        {
            _currentSettings.musicVolume = Mathf.Clamp01(value);
            SaveSettings();
            OnSettingsChanged?.Invoke();
        }
    }

    public bool MusicEnabled
    {
        get => _currentSettings.musicEnabled;
        set
        {
            _currentSettings.musicEnabled = value;
            SaveSettings();
            OnSettingsChanged?.Invoke();
        }
    }

    // 按键设置属性
    public KeyCode MoveForwardKey
    {
        get => _currentSettings.moveForwardKey;
        set
        {
            _currentSettings.moveForwardKey = value;
            SaveSettings();
            OnKeyBindingChanged?.Invoke(value, "MoveForward");
            OnSettingsChanged?.Invoke();
        }
    }

//以下为水门汀更新的公开调用方法

    public KeyCode MoveBackKey
    {
        get => _currentSettings.moveBackKey;
        set
        {
            _currentSettings.moveBackKey = value;
            SaveSettings();
            OnKeyBindingChanged?.Invoke(value, "MoveBack");
            OnSettingsChanged?.Invoke();
        }
    }

    public KeyCode MoveLeftKey
    {
        get => _currentSettings.moveLeftKey;
        set
        {
            _currentSettings.moveLeftKey = value;
            SaveSettings();
            OnKeyBindingChanged?.Invoke(value, "MoveLeft");
            OnSettingsChanged?.Invoke();
        }
    }

    public KeyCode MoveRightKey
    {
        get => _currentSettings.moveRightKey;
        set
        {
            _currentSettings.moveRightKey = value;
            SaveSettings();
            OnKeyBindingChanged?.Invoke(value, "MoveRight");
            OnSettingsChanged?.Invoke();
        }
    }

    public KeyCode JumpKey
    {
        get => _currentSettings.jumpKey;
        set
        {
            _currentSettings.jumpKey = value;
            SaveSettings();
            OnKeyBindingChanged?.Invoke(value, "Jump");
            OnSettingsChanged?.Invoke();
        }
    }

    public KeyCode InteractKey
    {
        get => _currentSettings.interactKey;
        set
        {
            _currentSettings.interactKey = value;
            SaveSettings();
            OnKeyBindingChanged?.Invoke(value, "Interact");
            OnSettingsChanged?.Invoke();
        }
    }

    public KeyCode SkillKey
    {
        get => _currentSettings.skillKey;
        set
        {
            _currentSettings.skillKey = value;
            SaveSettings();
            OnKeyBindingChanged?.Invoke(value, "Skill");
            OnSettingsChanged?.Invoke();
        }
    }

    public KeyCode LikeKey
    {
        get => _currentSettings.likeKey;
        set
        {
            _currentSettings.likeKey = value;
            SaveSettings();
            OnKeyBindingChanged?.Invoke(value, "Like");
            OnSettingsChanged?.Invoke();
        }
    }

    public float SfxVolume
    {
        get => _currentSettings.sfxVolume;
        set
        {
            _currentSettings.sfxVolume= Mathf.Clamp01(value);
            SaveSettings();
            OnSettingsChanged?.Invoke();
        }
    }

    public int ResolutionIndex
    {
        get => _currentSettings.resolutionIndex;
        set
        {
            _currentSettings.resolutionIndex = value;
            _currentSettings.resolution = _currentSettings.resolutions[value];
            SaveSettings();
            OnSettingsChanged?.Invoke();
            Screen.SetResolution(_currentSettings.resolution.x, _currentSettings.resolution.y, _currentSettings.isFullscreen);
        }
    }

//水门汀的更新结束（下面还有一句）

    // 画面设置属性
    public int QualityLevel
    {
        get => _currentSettings.qualityLevel;
        set
        {
            _currentSettings.qualityLevel = value;
            QualitySettings.SetQualityLevel(value);
            SaveSettings();
            OnSettingsChanged?.Invoke();
        }
    }

    public bool IsFullscreen
    {
        get => _currentSettings.isFullscreen;
        set
        {
            _currentSettings.isFullscreen = value;
            Screen.fullScreen = value;
            SaveSettings();
            OnSettingsChanged?.Invoke();
            //水门汀增加了下面一句
            Screen.SetResolution(_currentSettings.resolution.x, _currentSettings.resolution.y, _currentSettings.isFullscreen);

        }
    }

    #endregion

    #region 数据持久化

    private void SaveSettings()
    {
        try
        {
            string jsonData = JsonUtility.ToJson(_currentSettings);
            PlayerPrefs.SetString(SETTINGS_SAVE_KEY, jsonData);
            PlayerPrefs.Save();
            Debug.Log("设置已保存");
        }
        catch (System.Exception e)
        {
            Debug.LogError($"保存设置失败: {e.Message}");
        }
    }

    private void LoadSettings()
    {
        try
        {
            if (PlayerPrefs.HasKey(SETTINGS_SAVE_KEY))
            {
                string jsonData = PlayerPrefs.GetString(SETTINGS_SAVE_KEY);
                _currentSettings = JsonUtility.FromJson<GameSettingsData>(jsonData);
                Debug.Log("设置加载成功");
            }
            else
            {
                _currentSettings = new GameSettingsData();
                SaveSettings();
                Debug.Log("创建默认设置");
            }

            // 应用加载的设置
            ApplyCurrentSettings();
        }
        catch (System.Exception e)
        {
            Debug.LogError($"加载设置失败: {e.Message}");
            _currentSettings = new GameSettingsData();
        }
    }

    // 应用当前设置到游戏系统
    private void ApplyCurrentSettings()
    {
        // 应用画面设置
        QualitySettings.SetQualityLevel(_currentSettings.qualityLevel);
        Screen.fullScreen = _currentSettings.isFullscreen;

        // 音频设置会在AudioSystem中通过事件响应
    }

    #endregion

    #region 公共方法

    // 重置为默认设置
    public void ResetToDefault()
    {
        _currentSettings = new GameSettingsData();
        SaveSettings();
        ApplyCurrentSettings();
        OnSettingsChanged?.Invoke();
        Debug.Log("已重置为默认设置");
    }

    // 获取完整设置数据（供其他系统使用）
    public GameSettingsData GetCurrentSettings()
    {
        return _currentSettings;
    }

    // 设置界面中的调用示例
    public void ApplySettingsImmediately()
    {
        SaveSettings();
        OnSettingsChanged?.Invoke();
        Debug.Log("设置已立即应用");
    }

    #endregion
}