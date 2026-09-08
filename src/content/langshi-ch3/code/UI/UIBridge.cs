using Unity.Collections;
using Unity.VisualScripting;
using UnityEngine;

/**************************************************
 * 【核心gongneng】
 * 1. 作为游戏逻辑系统与UI系统之间的**唯一事件桥梁**。
 * 2. 监听所有在 `GameEvents` 中定义的全局游戏事件。
 * 3. 将事件数据转发给对应的UI面板进行更新。
 * 
 * 【修改说明】
 * 1. 事件链路已激活：所有事件处理方法中的UI调用代码已取消注释。
 * 2. 模拟数据：`OnFlowChanged` 和 `OnExpChanged` 方法中使用了临时模拟值（`maxFlow = 100f`, `currentLevel = 1`）。
 *     → 任务：在 `FlowSys`、`ExpSys` 等系统完成后，请将模拟值替换为实际的系统属性调用（例如 `FlowSys.Instance.MaxFlow`）。
 * 3. 面板获取：统一使用 `UIManager.Instance?.GetPanel<T>()` 来获取抽象面板。
 *     → 任务：请确保你实现的具体面板（如 `ConcreteGameHUDPanel`）已正确继承 `GameHUDPanel` 等抽象类，并已在 `UIManager` 中注册。
 * 4. 错误处理：在关键位置添加了 `Debug.LogWarning`，用于在面板未找到时提示。联调时请关注控制台输出。
 **************************************************/

public class UIBridge : MonoBehaviour
{

    void Start()
    {
        InitializeUIBridge();
    }

    void InitializeUIBridge()
{
    if (UIManager.Instance == null)
    {
        Debug.Log("UIManager not found!");
        return;
    }
    SubscribeToGameEvents();
}

    /// <summary>
    /// 订阅所有GameEvents中定义的游戏事件。
    /// 【注意】确保GameEvents中这些事件已被正确触发，否则UI不会更新。
    /// </summary>
    void SubscribeToGameEvents()
    {
        // 血量更改系统事件
        GameEvents.OnPlayerCurrentHealthChanged += OnCurrenthealthChanged;
        GameEvents.OnPlayerMaxHealthTemChanged += OnMaxhealthTemChanged;
        GameEvents.OnPlayerMaxHealthPreChanged += OnMaxhealthPreChanged;
        // 订阅流量系统事件
        GameEvents.OnFlowChanged += OnFlowChanged;
        GameEvents.OnFlowWaveStarted += OnFlowWaveStarted;
        GameEvents.OnFlowWaveEnded += OnFlowWaveEnded;

        // 订阅粉丝系统事件
        GameEvents.OnFansChanged += OnFansChanged;

        // 订阅经验系统事件
        GameEvents.OnPlayerExpChanged += OnExpChanged;
        GameEvents.OnPlayerLevelUp += OnLevelUp;

        // 订阅货币系统事件
        GameEvents.OnCurrencyChanged += OnCurrencyChanged;

        // 订阅教程系统事件
        GameEvents.OnTutorialStepStarted += OnTutorialStepStarted;
        GameEvents.OnTutorialStepCompleted += OnTutorialStepCompleted;
        GameEvents.OnTutorialCompleted += OnTutorialCompleted;

        // 订阅成就系统事件
        GameEvents.OnAchievementUnlocked += OnAchievementUnlocked;

        // 订阅解锁系统事件
        GameEvents.OnSystemUnlocked += OnSystemUnlocked;
        GameEvents.OnContentUnlocked += OnContentUnlocked;

        //子弹变化事件
         GameEvents.OnBulletChanged += OnBulletChanged;
    }

    #region 事件处理方法(激活UI调用)
    // 血量变化事件
    void OnCurrenthealthChanged(float amount)
    {
        var hud = UIManager.Instance?.GetPanel<CombatHUDPanel>();
        if (hud != null) 
        {
            hud.UpdateCurrentHealth(amount);
        }
        else
        {
            Debug.LogWarning("UIBridge: 未找到GmaeHUDPanel，请确认HUD存在！");
        }
    }

    void OnMaxhealthTemChanged(float amount)
    {
        amount = amount + StatisticsManager.Instance.MaxHealthPre;
        var hud = UIManager.Instance?.GetPanel<CombatHUDPanel>();
        if (hud != null) 
        {
            hud.UpdateMaxHealth(amount);
        }
        else
        {
            Debug.LogWarning("UIBridge: 未找到GmaeHUDPanel，请确认HUD存在！");
        }
    }

    void OnMaxhealthPreChanged(float amount)
    {
        amount = amount + StatisticsManager.Instance.MaxHealthTem;
        var hud = UIManager.Instance?.GetPanel<CombatHUDPanel>();
        if (hud != null) 
        {

            hud.UpdateMaxHealth(amount);
        }
        else
        {
            Debug.LogWarning("UIBridge: 未找到GmaeHUDPanel，请确认HUD存在！");
        }
    }

    // 流量变化事件，更新HUD流量条
    void OnFlowChanged(float currentFlow)
    {
        Debug.Log($"Flow updated: {currentFlow}");

        var hud = UIManager.Instance?.GetPanel<GameHUDPanel>();
        if (hud != null) 
        {
            float maxFlow = 100f;//临时模拟最大值，需要替换实际值
            float percentage = currentFlow / maxFlow;
            hud.UpdateFlow(percentage);
        }
        else
        {
            // 这个报错后面的我都没写，你可以看着加，照着我这个超也可以
            Debug.LogWarning("UIBridge: 未找到GmaeHUDPanel，请确认HUD存在！");
        }
    }

    // 粉丝变化事件：更新HUD粉丝数
    void OnFansChanged(int fansCount)
    {
        Debug.Log($"Fans updated: {fansCount}");
        var hud = UIManager.Instance?.GetPanel<GameHUDPanel>();
        if (hud != null) 
        {
            hud.UpdateFans(fansCount);
        }
    }

    // 经验变化事件：更新HUD经验条和等级
    void OnExpChanged(int currentExp, int nextLevelExp)
    {
        Debug.Log($"Exp updated: {currentExp}/{nextLevelExp}");
        var hud = UIManager.Instance?.GetPanel<GameHUDPanel>();
        if (hud != null) 
        {
            float percentage = (float)currentExp / nextLevelExp;
            int currentLevel = 1;
            hud.UpdateExp(percentage, currentLevel);
        }
    }

    // 货币变化事件：更新HUD货币显示
    void OnCurrencyChanged(int currency)
    {
        Debug.Log($"Currency updated: {currency}");
        var hud = UIManager.Instance?.GetPanel<GameHUDPanel>();
        if (hud != null)
        {

            hud.UpdateCurrency(currency);
        }

    }

    // 玩家升级事件：更新HUD等级并显示提示
    void OnLevelUp(int level)
    {
        Debug.Log($"Level up: {level}");
        var hud = UIManager.Instance?.GetPanel<GameHUDPanel>();
        if (hud != null)
        {
            hud.UpdateLevel(level);
        }

        ShowLevelUpMessage(level);
    }

    // 流量波次开始事件：显示升级选择面板
    void OnFlowWaveStarted()
    {
        Debug.Log("Flow wave started");
        var upgradePanel = UIManager.Instance?.GetPanel<UpgradeSelectionPanel>();
        if (upgradePanel != null)
        {
            // 框架会自动显示面板。
            // 但仍需要扩展：
            // 如需在显示时传入升级选项数据
            // 可在此处调用 upgradePanel.SetupOptions(data)
            UIManager.Instance.ShowPanel(upgradePanel);
        }
    }

    // 教程步骤开始事件：显示教程面板
    void OnTutorialStepStarted(string stepName)
    {
        Debug.Log($"Tutorial step started: {stepName}");
        var tutorialPanel = UIManager.Instance?.GetPanel<TutorialPanel>();
        if (tutorialPanel != null)
        {
            UIManager.Instance.ShowPanel(tutorialPanel);
            tutorialPanel.ShowTutorialStep(stepName);
        }
    }

    //子弹变化事件
    void OnBulletChanged(int count)
    {
        var hud = UIManager.Instance?.GetPanel<CombatHUDPanel>();
        if (hud != null) 
        {
            hud.UpdateBullet(count);
        }
        else
        {
            Debug.LogWarning("UIBridge: 未找到GmaeHUDPanel，请确认HUD存在！");
        }
    }

    void OnTutorialStepCompleted(string stepName)
    {
        Debug.Log($"Tutorial step completed: {stepName}");
        // 可以加一些下一步的功能，比如隐藏步骤或者进行下一步指导

    }

    void OnTutorialCompleted()
    {
        Debug.Log("Tutorial completed");
        var tutorialPanel = UIManager.Instance?.GetPanel<TutorialPanel>();
        if (tutorialPanel != null)
        {
            UIManager.Instance.HidePanel(tutorialPanel);
        }
    }

    void OnAchievementUnlocked(string achievementId)
    {
        Debug.Log($"Achievement unlocked: {achievementId}");
        ShowAchievementMessage(achievementId, "Achievement description");
    }

    void OnSystemUnlocked(string systemId)
    {
        Debug.Log($"System unlocked: {systemId}");
        // 可在此触发新系统解锁的UI提示
    }

    void OnContentUnlocked(string contentId)
    {
        Debug.Log($"Content unlocked: {contentId}");
        ShowContentUnlockedMessage(contentId, "Content description");
    }

    void OnFlowWaveEnded()
    {
        Debug.Log("Flow wave ended");
        // 可在此处隐藏升级面板或进行波次结束处理
        var upgradePanel = UIManager.Instance?.GetPanel<UpgradeSelectionPanel>();
        if (upgradePanel != null && upgradePanel.IsVisible())
        {
            UIManager.Instance.HidePanel(upgradePanel);
        }
    }

    #endregion

    #region 提示信息显示 (待实现)

    /// <summary>
    /// 需要你实现：此处用于显示玩家升级时的全屏或弹窗提示。
    /// 可接入一个全局的“信息提示系统”。
    /// </summary>
    void ShowLevelUpMessage(int level)
    {
        Debug.Log($"Level up to {level}!");
        // 目前需要你拓展: 接入全局信息提示系统的调用
        // 例如：MessageSystem.Show($"恭喜升级到 {level} 级！");
    }

    void ShowAchievementMessage(string name, string description)
    {
        Debug.Log($"Achievement: {name} - {description}");
        // 这里可以调用成就解锁提示UI系统
    }

    void ShowContentUnlockedMessage(string itemName, string description)
    {
        Debug.Log($"Content: {itemName} - {description}");
        // 这里可以调用内容解锁提示UI系统
    }

    #endregion

    private void OnDestroy()
    {
        GameEvents.OnFlowChanged -= OnFlowChanged;
        GameEvents.OnFlowWaveStarted -= OnFlowWaveStarted;
        GameEvents.OnFlowWaveEnded -= OnFlowWaveEnded;
        GameEvents.OnFansChanged -= OnFansChanged;
        GameEvents.OnPlayerExpChanged -= OnExpChanged;
        GameEvents.OnPlayerLevelUp -= OnLevelUp;
        GameEvents.OnCurrencyChanged -= OnCurrencyChanged;
        GameEvents.OnTutorialStepStarted -= OnTutorialStepStarted;
        GameEvents.OnTutorialStepCompleted -= OnTutorialStepCompleted;
        GameEvents.OnTutorialCompleted -= OnTutorialCompleted;
        GameEvents.OnAchievementUnlocked -= OnAchievementUnlocked;
        GameEvents.OnSystemUnlocked -= OnSystemUnlocked;
        GameEvents.OnContentUnlocked -= OnContentUnlocked;
    }
}