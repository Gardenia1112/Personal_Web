using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;

public class InGame_Upgrade : UpgradeSelectionPanel
{
    public TextMeshProUGUI Option1;
    public TextMeshProUGUI Option2;
    public TextMeshProUGUI Option3;

    public Button Btn1;
    public Button Btn2;
    public Button Btn3;

    private List<UpgradeSys.UpgradeOption> currentOptions;

    public override void SetupOptions(UpgradeSys.UpgradeOption[] options)
{
    // 这个方法由其他系统调用，但我们使用 OnEnable 自动获取
    // 这里可以留空，或者调用 DisplayOptions()
    if (options != null && options.Length > 0)
    {
        currentOptions = new List<UpgradeSys.UpgradeOption>(options);
        DisplayOptions();
    }
}

    private void Awake()
    {
        // 初始化按钮监听
        Btn1.onClick.AddListener(() => OnOptionSelected(0));
        Btn2.onClick.AddListener(() => OnOptionSelected(1));
        Btn3.onClick.AddListener(() => OnOptionSelected(2));
    }

    private void OnEnable()
    {
        // 面板显示时，自动从UpgradeSys获取3个随机升级选项
        if (UpgradeSys.Instance != null)
        {
            currentOptions = UpgradeSys.Instance.GenerateUpgradeOptions(3);
            DisplayOptions();
        }
    }

    private void DisplayOptions()
    {
        if (currentOptions == null) return;

        // 选项1
        if (currentOptions.Count >= 1)
        {
            var opt = currentOptions[0];
            Option1.text = $"{opt.name}\n<size=70%><color=#AAAAAA>{opt.description}</color></size>";
            Btn1.gameObject.SetActive(true);
        }
        else
        {
            Btn1.gameObject.SetActive(false);
        }

        // 选项2
        if (currentOptions.Count >= 2)
        {
            var opt = currentOptions[1];
            Option2.text = $"{opt.name}\n<size=70%><color=#AAAAAA>{opt.description}</color></size>";
            Btn2.gameObject.SetActive(true);
        }
        else
        {
            Btn2.gameObject.SetActive(false);
        }

        // 选项3
        if (currentOptions.Count >= 3)
        {
            var opt = currentOptions[2];
            Option3.text = $"{opt.name}\n<size=70%><color=#AAAAAA>{opt.description}</color></size>";
            Btn3.gameObject.SetActive(true);
        }
        else
        {
            Btn3.gameObject.SetActive(false);
        }
    }

    private void OnOptionSelected(int index)
    {
        if (currentOptions != null && index < currentOptions.Count)
        {
            // 应用选中的升级
            UpgradeSys.Instance.ApplyUpgrade(currentOptions[index]);

            // 隐藏面板
            gameObject.SetActive(false);
            Hide();
            UIManager.Instance.ShowPanel("InGame_Main_Combat");
        }
    }
}