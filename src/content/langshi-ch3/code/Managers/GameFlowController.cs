using UnityEngine;

// 这是流程控制系统
// 此处数值需要较多，不会设置，所以用的AI
// 有待调整，使用AI的部分做了详细备注

public class GameFlowController : MonoBehaviour
{
    public static GameFlowController Instance;

    public enum GamePhase
    {
        Tutorial,
        EarlyGame,
        MidGame,
        LateGame,
        BossFight
    }

    public GamePhase currentPhase = GamePhase.Tutorial;

    [Header("难度调节")]
    public int fansForMidGame = 50;
    public int fansForLateGame = 100;
    public int fansForBossFight = 200;

    public float enemySpawnRateMultiplier = 1f;
    public float enemyHealthMultiplier = 1f;
    public float enemyDamageMultiplier = 1f;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            SetupEventListeners();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void SetupEventListeners()
    {
        FansSys.Instance.OnFansChanged += OnFansChanged;
        FlowSys.Instance.OnFlowWaveStarted += OnFlowWaveStarted;
        FlowSys.Instance.OnFlowWaveEnded += OnFlowWaveEnded;
        ExpSys.Instance.OnLevelUp += OnLevelUp;
    }

    // 根据粉丝数调整游戏阶段
    private void OnFansChanged(int fans)
    {
        GamePhase newPhase = currentPhase;

        if (fans >= fansForBossFight)
        {
            newPhase = GamePhase.BossFight;
        }
        else if (fans >= fansForLateGame)
        {
            newPhase = GamePhase.LateGame;
        }
        else if (fans >= fansForMidGame)
        {
            newPhase = GamePhase.MidGame;
        }
        else if (fans > 0)
        {
            newPhase = GamePhase.EarlyGame;
        }

        if (newPhase != currentPhase)
        {
            ChangeGamePhase(newPhase);
        }

        AdjustDifficulty(fans);
    }

    private void ChangeGamePhase(GamePhase newPhase)
    {
        GamePhase oldPhase = currentPhase;
        currentPhase = newPhase;
        OnGamePhaseChanged(oldPhase, newPhase);
    }

    private void OnGamePhaseChanged(GamePhase oldPhase, GamePhase newPhase)
    {
        switch (newPhase)
        {
            case GamePhase.EarlyGame:
                // 解锁基础功能
                break;

            case GamePhase.MidGame:
                // 解锁中级功能，增加敌人种类
                break;

            case GamePhase.LateGame:
                // 解锁高级功能，准备Boss战
                break;

            case GamePhase.BossFight:
                // 触发Boss战
                TriggerBossFight();
                break;
        }
    }

    private void AdjustDifficulty(int fans)
    {
        // 基于粉丝数动态调整难度
        // AI推荐的平方根曲线，前期增长快后期慢
        float difficultyCurve = Mathf.Pow(fans / 100f, 0.5f); 

        enemySpawnRateMultiplier = 1f + difficultyCurve * 2f; // 1-3倍
        enemyHealthMultiplier = 1f + difficultyCurve * 1.5f;  // 1-2.5倍  
        enemyDamageMultiplier = 1f + difficultyCurve * 1f;    // 1-2倍

        // 应用难度调整到敌人生成器
        //var spawners = FindObjectsOfType<EnemySpawner>();
        //foreach (var spawner in spawners)
        //{
        //    spawner.SetSpawnerParameters(
        //        Mathf.RoundToInt(spawner.maxEnemies * enemySpawnRateMultiplier),
        //        spawner.spawnInterval / enemySpawnRateMultiplier
        //    );
        //}
    }

    private void OnFlowWaveStarted()
    {
        // 流量热潮期间的全局效果
        // 增加玩家属性
        var moveAbility = FindObjectOfType<Ability_Move>();
        if (moveAbility != null)
        {
            // 临时增加移动速度等
        }
    }

    private void OnFlowWaveEnded()
    {
        // 热潮结束
    }

    private void OnLevelUp(int level)
    {
        // 等级提升的全局效果
        // 基于等级微调难度
        float levelBonus = level * 0.05f; // 每级增加5%难度
        enemySpawnRateMultiplier += levelBonus;
        enemyHealthMultiplier += levelBonus;
    }

    private void TriggerBossFight()
    {
        // 生成Boss敌人
        // 这里可以添加Boss战特定的逻辑
        // 比如生成特殊Boss敌人，改变背景音乐等
    }

    public void StartTutorialPhase()
    {
        currentPhase = GamePhase.Tutorial;
        // 初始化教程特定的设置
        enemySpawnRateMultiplier = 0.5f; // 教程阶段降低难度
    }

    public void CompleteTutorial()
    {
        if (currentPhase == GamePhase.Tutorial)
        {
            ChangeGamePhase(GamePhase.EarlyGame);
        }
    }
}