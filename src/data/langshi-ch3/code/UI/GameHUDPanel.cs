/// <summary>
/// 游戏HUD面板接口
/// UI团队需要实现这个类
/// 注意，此为AI参考，具体情况需要修改
/// 不可直接使用此代码！
/// </summary>
public abstract class GameHUDPanel : UIPanel
{
    public abstract void UpdateFlow(float percentage);
    public abstract void UpdateFans(int count);
    public abstract void UpdateExp(float percentage, int level);
    public abstract void UpdateCurrency(int amount);
    public abstract void UpdateLevel(int level);
}
public abstract class CombatHUDPanel : UIPanel
{
    public abstract void UpdateCurrentHealth(float amount);
    public abstract void UpdateMaxHealth(float amount);

    public abstract void UpdateBullet(int count);
}
/// <summary>
/// 升级选择面板接口
/// UI团队需要实现这个类
/// </summary>
public abstract class UpgradeSelectionPanel : UIPanel
{
    public abstract void SetupOptions(UpgradeSys.UpgradeOption[] options);
}

/// <summary>
/// 教程面板接口  
/// UI团队需要实现这个类
/// </summary>
public abstract class TutorialPanel : UIPanel
{
    public abstract void ShowTutorialStep(string stepName);
}