using System.Collections.Generic;
using UnityEngine;

public class StylishActionSys : MonoBehaviour
{
    public static StylishActionSys Instance;

    [System.Serializable]
    public class StylishAction
    {
        public string actionId;
        public string displayName;
        public string description;
        public int baseFansReward;
        public int baseFlowReward;
        public float cooldown = 5f;

        [System.NonSerialized]
        public float lastPerformTime = 0f;
    }

    public List<StylishAction> availableActions = new List<StylishAction>
    {
        new StylishAction {
            actionId = "multi_kill",
            displayName = "多重击杀",
            description = "短时间内击杀多个敌人",
            baseFansReward = 5,
            baseFlowReward = 25
        },
        new StylishAction {
            actionId = "no_damage",
            displayName = "无伤通关",
            description = "完成关卡不受伤害",
            baseFansReward = 10,
            baseFlowReward = 50
        }
    };

    private Dictionary<string, StylishAction> actionDictionary = new Dictionary<string, StylishAction>();

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeActions();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeActions()
    {
        foreach (var action in availableActions)
        {
            actionDictionary[action.actionId] = action;
        }
    }

    public bool PerformStylishAction(string actionId, int multiplier = 1)
    {
        if (!actionDictionary.ContainsKey(actionId)) return false;

        var action = actionDictionary[actionId];

        if (Time.time - action.lastPerformTime < action.cooldown)
        {
            return false;
        }

        int fansReward = action.baseFansReward * multiplier;
        int flowReward = action.baseFlowReward * multiplier;

        if (FlowSys.Instance.isInFlowWave)
        {
            fansReward = Mathf.RoundToInt(fansReward * FlowSys.Instance.fansMultiplierInWave);
            flowReward = Mathf.RoundToInt(flowReward * FlowSys.Instance.flowMultiplierInWave);
        }
        FansSys.Instance.AddFans(fansReward, $"stylish_{actionId}");
        FlowSys.Instance.AddFlow(flowReward, $"stylish_{actionId}");
        ExpSys.Instance.AddExp(fansReward, $"stylish_{actionId}");

        action.lastPerformTime = Time.time;
        return true;
    }

    public void OnMultiKill(int killCount)
    {
        int multiplier = Mathf.Min(killCount / 2, 3);
        PerformStylishAction("multi_kill", multiplier);
    }

    public void OnNoDamageComplete()
    {
        PerformStylishAction("no_damage");
    }

    public bool IsActionAvailable(string actionId)
    {
        if (!actionDictionary.ContainsKey(actionId)) return false;

        var action = actionDictionary[actionId];
        return Time.time - action.lastPerformTime >= action.cooldown;
    }
}