using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class VisualsAndSoundeffectsPanel : UIPanel
{
    public TextMeshProUGUI MasterVolumeText;
    public TextMeshProUGUI SoundEffectVolumeText;
    public TextMeshProUGUI MusicVolumeText;
    public TextMeshProUGUI ScreenModeText;
    public TextMeshProUGUI ResolutionText;
    public TextMeshProUGUI ImageQualityText;
    
    public Button Operation;
    public Button VisualsAndSoundeffects;
    public Button Other;

    public Button ResolutionLeft;
    public Button ResolutionRight;
    public string[] Resolutions = new string[]
    {
        "800 x 600",
        "1024 x 768",
        "1280 x 720",
        "1366 x 768",
        "1600 x 900",
        "1920 x 1080",
        "2560 x 1440"
    };
    public Button ImageQualityLeft;
    public Button ImageQualityRight;

    public Button ScreenModeLeft;
    public Button ScreenModeRight;

    public Slider MasterVolume;
    public Slider MusicVolume;
    public Slider SoundEffectVolume;

    public Button PanelLeft;
    public Button PanelRight;

    // Start is called before the first frame update
    void Start()
    {
        Operation.onClick.AddListener(ChangeOperation);
        Other.onClick.AddListener(ChangeOther);
        ResolutionLeft.onClick.AddListener(ResolutionSub);
        ResolutionRight.onClick.AddListener(ResolutionSubPlus);
        ImageQualityLeft.onClick.AddListener(ImageQualitySub);
        ImageQualityRight.onClick.AddListener(ImageQualityPlus);
        ScreenModeLeft.onClick.AddListener(ScreenModeSub);
        ScreenModeRight.onClick.AddListener(ScreenModePlus);
        MasterVolume.onValueChanged.AddListener(MasterVolumeChanged);
        MusicVolume.onValueChanged.AddListener(MusicVolumeChanged);
        SoundEffectVolume.onValueChanged.AddListener(SoundEffectVolumeChanged);
        PanelLeft.onClick.AddListener(PanelToLeft);
        PanelRight.onClick.AddListener(PanelToRight);
    }

    // Update is called once per frame
    void Update()
    {
        
    }
    public override void Initialize()
    {
        base.Initialize(); // 调用基类初始化
        // 你的初始化代码
    }
    public override void Show()
    {
        SetAllData();
        base.Show(); // 调用基类显示逻辑
        // 面板显示时的自定义逻辑
    }
    public override void Hide()
    {
        base.Hide(); // 调用基类隐藏逻辑
        // 面板隐藏时的自定义逻辑
    }
    
    void ChangeOperation()
    {
        UIManager.Instance.ShowPanel("OperationPanel");
    }
    void ChangeOther()
    {
        
    }
    void ResolutionSub()
    {
        int value = SettingsManager.Instance.ResolutionIndex;
        if(value>0){value-=1;}
        SettingsManager.Instance.ResolutionIndex = value;
        ResolutionText.text=Resolutions[value];
    }
    void ResolutionSubPlus()
    {
        int value = SettingsManager.Instance.ResolutionIndex;
        if(value<6){value+=1;}
        SettingsManager.Instance.ResolutionIndex = value;
        ResolutionText.text=Resolutions[value];
    }
    void ImageQualitySub()
    {
        int value = SettingsManager.Instance.QualityLevel;
        value-=1;
        SettingsManager.Instance.QualityLevel=value;
        ImageQualityText.text=value.ToString();
    }
    void ImageQualityPlus()
    {
        int value = SettingsManager.Instance.QualityLevel;
        value+=1;
        SettingsManager.Instance.QualityLevel=value;
        ImageQualityText.text=value.ToString();
    }
    void ScreenModeSub()
    {
        bool value = SettingsManager.Instance.IsFullscreen;
        if(value){value = false;}
        else { value = true; }
        SettingsManager.Instance.IsFullscreen=value;
        if(value){ScreenModeText.text="Fullscreen";}else{ScreenModeText.text="Window";}
    }
    void ScreenModePlus()
    {
        bool value = SettingsManager.Instance.IsFullscreen;
        if(value){value = false;}
        else { value = true; }
        SettingsManager.Instance.IsFullscreen=value;
        if(value){ScreenModeText.text="Fullscreen";}else{ScreenModeText.text="Window";}
    }
    void MasterVolumeChanged(float value)
    {
        SettingsManager.Instance.MasterVolume = value;
        MasterVolumeText.text=(value*100).ToString("F0")+"%";
    }
    void MusicVolumeChanged(float value)
    {
        SettingsManager.Instance.MusicVolume = value;
        MusicVolumeText.text=(value*100).ToString("F0")+"%";
    }
    void SoundEffectVolumeChanged(float value)
    {
        SettingsManager.Instance.SfxVolume = value;
        SoundEffectVolumeText.text=(value*100).ToString("F0")+"%";
    }

    void PanelToLeft()
    {
        UIManager.Instance.ShowPanel("OperationPanel");
    }

    void PanelToRight()
    {
        
    }
    void SetAllData()
    {
        MasterVolumeText.text = (SettingsManager.Instance.MasterVolume*100).ToString("F0")+"%";
        SoundEffectVolumeText.text = (SettingsManager.Instance.SfxVolume*100).ToString("F0")+"%";
        MusicVolumeText.text = (SettingsManager.Instance.MusicVolume*100).ToString("F0")+"%";

        MasterVolume.value = SettingsManager.Instance.MasterVolume;
        MusicVolume.value = SettingsManager.Instance.MusicVolume;
        SoundEffectVolume.value = SettingsManager.Instance.SfxVolume;
        
        ImageQualityText.text = SettingsManager.Instance.QualityLevel.ToString();
        if(SettingsManager.Instance.IsFullscreen){ScreenModeText.text="Fullscreen";}else{ScreenModeText.text="Window";}
        ResolutionText.text = Resolutions[SettingsManager.Instance.ResolutionIndex];
    }
}
