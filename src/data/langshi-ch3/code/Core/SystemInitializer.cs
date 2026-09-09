using UnityEngine;
using System.Collections;

public class SystemInitializer : MonoBehaviour
{
    [Header("初始化顺序")]
    public bool autoInitialize = true;
    public float initializationDelay = 0.1f;

    private void Start()
    {
        if (autoInitialize)
        {
            StartCoroutine(InitializeSystemsSequentially());
        }
    }

    private IEnumerator InitializeSystemsSequentially()
    {
        // 第一层: 核心系统
        yield return CreateSystem<GameProgressManager>("GameProgressManager");
        yield return new WaitForSeconds(initializationDelay);

        // 第二层: 经济系统
        yield return CreateSystem<CurrencySys>("CurrencySystem");
        yield return CreateSystem<ExpSys>("ExperienceSystem");
        yield return CreateSystem<FansSys>("FansSystem");
        yield return CreateSystem<FlowSys>("FlowSystem");
        yield return new WaitForSeconds(initializationDelay);

        // 第三层: 游戏系统
        yield return CreateSystem<InventorySys>("InventorySystem");
        yield return CreateSystem<EquipmentSys>("EquipmentSystem");
        yield return CreateSystem<SkillManager>("SkillManager");
        yield return CreateSystem<UpgradeSys>("UpgradeSystem");
        yield return new WaitForSeconds(initializationDelay);

        // 第四层: 辅助系统
        yield return CreateSystem<AchievementSys>("AchievementSystem");
        yield return CreateSystem<EnemyRewardSys>("EnemyRewardSystem");
        yield return CreateSystem<StylishActionSys>("StylishActionSystem");
        yield return CreateSystem<GameFlowController>("GameFlowController");
        yield return new WaitForSeconds(initializationDelay);

        // 第五层: 管理器
        yield return CreateSystem<TutorialManager>("TutorialManager");
        yield return CreateSystem<UIManager>("UIManager");

        // 检查初始化状态
        CheckSystemStatus();
    }

    private IEnumerator CreateSystem<T>(string name) where T : Component
    {
        if (FindObjectOfType<T>() != null)
        {
            yield break;
        }

        GameObject systemObj = new GameObject(name);
        systemObj.AddComponent<T>();
        DontDestroyOnLoad(systemObj);
        yield return null;
    }

    private void CheckSystemStatus()
    {

        var systems = new (System.Type, string)[]
        {
            (typeof(CurrencySys), "货币系统"),
            (typeof(ExpSys), "经验系统"),
            (typeof(FansSys), "粉丝系统"),
            (typeof(FlowSys), "流量系统"),
            (typeof(InventorySys), "库存系统"),
            (typeof(SkillManager), "技能管理器"),
            (typeof(UpgradeSys), "升级系统"),
            (typeof(AchievementSys), "成就系统"),
            (typeof(TutorialManager), "教程管理器"),
            (typeof(UIManager), "UI管理器")
        };

        foreach (var (type, name) in systems)
        {
            var instance = FindObjectOfType(type);
        }
    }

    [ContextMenu("手动初始化系统")]
    public void ManualInitialize()
    {
        StartCoroutine(InitializeSystemsSequentially());
    }

    [ContextMenu("重启所有系统")]
    public void RestartAllSystems()
    {
        var systemObjects = GameObject.FindGameObjectsWithTag("System");
        foreach (var obj in systemObjects)
        {
            if (obj != gameObject)
                DestroyImmediate(obj);
        }

        StartCoroutine(InitializeSystemsSequentially());
    }
}