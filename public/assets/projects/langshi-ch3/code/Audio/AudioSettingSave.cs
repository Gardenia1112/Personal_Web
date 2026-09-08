using UnityEngine;

/// <summary>
/// 音量设置保存（PlayerPrefs）
/// 保存的是 0~1 的线性音量
/// </summary>
public static class AudioSettingsSave
{
    private const string MasterKey = "audio_master";
    private const string BgmKey    = "audio_bgm";
    private const string SfxKey    = "audio_sfx";
    private const string UiKey     = "audio_ui";
    private const string AmbKey    = "audio_amb";   // 环境音
    private const string MuteKey   = "audio_mute";

    // 读取（默认值都是 1）
    public static float Master => PlayerPrefs.GetFloat(MasterKey, 1f);
    public static float Bgm    => PlayerPrefs.GetFloat(BgmKey, 1f);
    public static float Sfx    => PlayerPrefs.GetFloat(SfxKey, 1f);
    public static float Ui     => PlayerPrefs.GetFloat(UiKey, 1f);
    public static float Amb    => PlayerPrefs.GetFloat(AmbKey, 1f); // 环境音
    public static bool Mute    => PlayerPrefs.GetInt(MuteKey, 0) == 1;

    // 写入（会自动 clamp 到 0~1）
    public static void SetMaster(float v) => PlayerPrefs.SetFloat(MasterKey, Mathf.Clamp01(v));
    public static void SetBgm(float v)    => PlayerPrefs.SetFloat(BgmKey, Mathf.Clamp01(v));
    public static void SetSfx(float v)    => PlayerPrefs.SetFloat(SfxKey, Mathf.Clamp01(v));
    public static void SetUi(float v)     => PlayerPrefs.SetFloat(UiKey, Mathf.Clamp01(v));
    public static void SetAmb(float v)    => PlayerPrefs.SetFloat(AmbKey, Mathf.Clamp01(v)); // 环境音
    public static void SetMute(bool m)    => PlayerPrefs.SetInt(MuteKey, m ? 1 : 0);

    public static void Save() => PlayerPrefs.Save();
}
