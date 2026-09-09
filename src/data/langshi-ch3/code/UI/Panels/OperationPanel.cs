using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class OperationPanel : UIPanel
{   
    public Button Operation;
    public Button VisualsAndSoundeffects;
    public Button Other; 

    public Button ResetButton;
    public Button ApplyButton;

    public ScrollRect ScrollRect;

    public TextMeshProUGUI ForwardKey;
    public Button ForwardButton;

    public TextMeshProUGUI BackKey;
    public Button BackButton;

    public TextMeshProUGUI LeftKey;
    public Button LeftButton;

    public TextMeshProUGUI RightKey;
    public Button RightButton;

    public TextMeshProUGUI JumpKey;
    public Button JumpButton;

    public TextMeshProUGUI InteractKey;
    public Button InteractButton;

    public TextMeshProUGUI SkillKey;
    public Button SkillButton;

    public TextMeshProUGUI LikeKey;
    public Button LikeButton;

    private bool WaitingForKey = false;
    private KeyCode UserDefinedKey;
    private string KeyDirection="";

    public Button PanelLeft;
    public Button PanelRight;
    void Start()
    {   
        VisualsAndSoundeffects.onClick.AddListener(ChangeVisuals);
        Other.onClick.AddListener(ChangeOther);

        ForwardButton.onClick.AddListener(ForwardChange);
        BackButton.onClick.AddListener(BackChange);
        LeftButton.onClick.AddListener(LeftChange);
        RightButton.onClick.AddListener(RightChange);
        JumpButton.onClick.AddListener(JumpChange);
        InteractButton.onClick.AddListener(InteractChange);
        SkillButton.onClick.AddListener(SkillChange);
        LikeButton.onClick.AddListener(LikeChange);

        ResetButton.onClick.AddListener(Reset);
        ApplyButton.onClick.AddListener(Apply);
        PanelLeft.onClick.AddListener(PanelToLeft);
        PanelRight.onClick.AddListener(PanelToRight);
    
    }

    void Update()
    {
        if(WaitingForKey)
        {
            foreach (KeyCode k in System.Enum.GetValues(typeof(KeyCode)))
            {
                if (Input.GetKeyDown(k) && k != KeyCode.Escape) // 排除 ESC 防退出
                {
                    Debug.Log("你设置了键: " + k);
                    UserDefinedKey = k;
                    WaitingForKey = false;
                    SetTheKey();
                    break;
                }
            }
        }
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
        ScrollRect.verticalNormalizedPosition = 1f;
    }
    public override void Hide()
    {
        base.Hide(); // 调用基类隐藏逻辑
        // 面板隐藏时的自定义逻辑
    }

    void ChangeOther()
    {
        
    }
    void ChangeVisuals()
    {
        UIManager.Instance.ShowPanel("VisualsAndSoundeffectsPanel");
    }

    void ForwardChange()
    {
        WaitingForKey = true;
        ForwardKey.text = "press any key";
        KeyDirection = "Forward";
        SettingsManager.Instance.MoveForwardKey = UserDefinedKey;
    }

    void BackChange()
    {
        WaitingForKey = true;
        BackKey.text = "press any key";
        KeyDirection = "Back";
        SettingsManager.Instance.MoveBackKey = UserDefinedKey;
    }

    void LeftChange()
    {
        WaitingForKey = true;
        LeftKey.text = "press any key";
        KeyDirection = "Left";
        SettingsManager.Instance.MoveLeftKey = UserDefinedKey;
    }

    void RightChange()
    {
        WaitingForKey = true;
        RightKey.text = "press any key";
        KeyDirection = "Right";
        SettingsManager.Instance.MoveRightKey = UserDefinedKey;
    }

    void JumpChange()
    {
        WaitingForKey = true;
        JumpKey.text = "press any key";
        KeyDirection = "Jump";
        SettingsManager.Instance.JumpKey = UserDefinedKey;
    }

    void InteractChange()
    {
        WaitingForKey = true;
        InteractKey.text = "press any key";
        KeyDirection = "Interact";
        SettingsManager.Instance.InteractKey = UserDefinedKey;
    }

    void LikeChange()
    {
        WaitingForKey = true;
        LikeKey.text = "press any key";
        KeyDirection = "Like";
        SettingsManager.Instance.LikeKey = UserDefinedKey;
    }

    void SkillChange()
    {
        WaitingForKey = true;
        SkillKey.text = "press any key";
        KeyDirection = "Skill";
        SettingsManager.Instance.SkillKey = UserDefinedKey;
    }

    void SetTheKey()
    {
        switch(KeyDirection)
        {
            case "Forward":
            SettingsManager.Instance.MoveForwardKey = UserDefinedKey;
            break;
            case "Back":
            SettingsManager.Instance.MoveBackKey = UserDefinedKey;
            break;
            case "Left":
            SettingsManager.Instance.MoveLeftKey = UserDefinedKey;
            break;
            case "Right":
            SettingsManager.Instance.MoveRightKey = UserDefinedKey;
            break;
            case "Jump":
            SettingsManager.Instance.JumpKey = UserDefinedKey;
            break;
            case "Interact":
            SettingsManager.Instance.InteractKey = UserDefinedKey;
            break;
            case "Skill":
            SettingsManager.Instance.SkillKey = UserDefinedKey;
            break;
            case "Like":
            SettingsManager.Instance.LikeKey = UserDefinedKey;
            break;
        }
        SetAllData();
    }
    void Reset()
    {
        SettingsManager.Instance.ResetToDefault();
        SetAllData();
    }
    void Apply()
    {
        SettingsManager.Instance.ApplySettingsImmediately();
    }

    void SetAllData()
    {
        ForwardKey.text = SettingsManager.Instance.MoveForwardKey.ToString();
        BackKey.text= SettingsManager.Instance.MoveBackKey.ToString();
        LeftKey.text= SettingsManager.Instance.MoveLeftKey.ToString();
        RightKey.text= SettingsManager.Instance.MoveRightKey.ToString();
        JumpKey.text= SettingsManager.Instance.JumpKey.ToString();
        InteractKey.text= SettingsManager.Instance.InteractKey.ToString();
        SkillKey.text= SettingsManager.Instance.SkillKey.ToString();
        LikeKey.text= SettingsManager.Instance.LikeKey.ToString();
    }

    void PanelToLeft()
    {
        
    }

    void PanelToRight()
    {
        UIManager.Instance.ShowPanel("VisualsAndSoundeffectsPanel");
    }
}
