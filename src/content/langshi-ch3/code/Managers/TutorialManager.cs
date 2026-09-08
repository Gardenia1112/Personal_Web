using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TutorialManager : MonoBehaviour
{
    public static TutorialManager Instance;

    [System.Serializable]
    public class TutorialStep
    {
        public string stepName;
        public string instruction;
        public string triggerEvent; 
        public bool isCompleted = false;
        public float timeout = 30f; // 步骤超时时间
    }

    [Header("Tutorial Configuration")]
    public List<TutorialStep> tutorialSteps = new List<TutorialStep>();
    public bool tutorialCompleted = false;

    [Header("Tutorial Rewards")]
    public int tutorialExpReward = 100;
    public int tutorialCurrencyReward = 200;

    private int currentStepIndex = 0;
    private Coroutine tutorialCoroutine;
    private Coroutine currentStepCoroutine;

    private Dictionary<string, System.Action> stepCompletionHandlers = new Dictionary<string, System.Action>();

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            
            // 先检查是否需要重置教程状态（用于测试）
            if (PlayerPrefs.HasKey("TutorialCompleted"))
            {
                Debug.Log("[TutorialManager] Tutorial was completed before, resetting for new test");
                ResetTutorial();
            }
            
            InitializeTutorial();
            RegisterEventHandlers();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeTutorial()
    {
        tutorialSteps = new List<TutorialStep>
        {
            new TutorialStep {
                stepName = "Move",
                instruction = "Use WASD keys to move your character",
                triggerEvent = "player_moved",
                timeout = 20f
            },
            new TutorialStep {
                stepName = "Jump",
                instruction = "Press SPACE to jump",
                triggerEvent = "player_jumped",
                timeout = 15f
            },
            new TutorialStep {
                stepName = "Attack",
                instruction = "Use LEFT MOUSE BUTTON to attack enemies",
                triggerEvent = "player_attacked",
                timeout = 25f
            },
            new TutorialStep {
                stepName = "Reload",
                instruction = "Use R to reload your weapon",
                triggerEvent = "player_reloaded",
                timeout = 25f
            },
            /*暂时不介绍系统（水门汀）
            new TutorialStep {
                stepName = "Fans System Introduction",
                instruction = "Gain fans through stylish moves, more fans unlock more content",
                triggerEvent = "fans_explained",
                timeout = 15f
            },
            new TutorialStep {
                stepName = "Flow System Introduction",
                instruction = "Build up flow to trigger flow waves for powerful bonuses",
                triggerEvent = "flow_explained",
                timeout = 15f
            }
            */
        };
    }

    private void RegisterEventHandlers()
    {
        GameEvents.OnPlayerAction += OnPlayerAction;
        stepCompletionHandlers["player_moved"] = () => CompleteCurrentStep();
        stepCompletionHandlers["player_jumped"] = () => CompleteCurrentStep();
        stepCompletionHandlers["player_attacked"] = () => CompleteCurrentStep();
        stepCompletionHandlers["player_reloaded"] = () => CompleteCurrentStep();
        //暂时不介绍系统（水门汀）
        //stepCompletionHandlers["fans_explained"] = () => CompleteCurrentStep();
        //stepCompletionHandlers["flow_explained"] = () => CompleteCurrentStep();
    }

    private void OnPlayerAction(string action)
    {
        if (!tutorialCompleted && currentStepIndex < tutorialSteps.Count)
        {
            var currentStep = tutorialSteps[currentStepIndex];
            string expectedEvent = $"player_{action}";
            if (currentStep.triggerEvent == expectedEvent && !currentStep.isCompleted)
            {
                stepCompletionHandlers[currentStep.triggerEvent]?.Invoke();
            }
        }
    }

    public void StartTutorial()
    {
        if (tutorialCompleted)
        {
            return;
        }

        if (tutorialCoroutine != null)
            StopCoroutine(tutorialCoroutine);

        tutorialCoroutine = StartCoroutine(RunTutorialSequence());
    }

    private IEnumerator RunTutorialSequence()
    {
        for (currentStepIndex = 0; currentStepIndex < tutorialSteps.Count; currentStepIndex++)
        {
            var currentStep = tutorialSteps[currentStepIndex];
            yield return StartCoroutine(ExecuteTutorialStep(currentStep));
        }
        CompleteTutorial();
    }

    private IEnumerator ExecuteTutorialStep(TutorialStep step)
    {
        GameEvents.TriggerTutorialStepStarted(step.stepName);

        // 显示UI提示
        // UIManager.Instance.ShowTutorialPrompt(step.instruction);
        // 抱歉，我没用这个（水门汀）

        bool stepCompleted = false;
        float stepStartTime = Time.time;

        while (!stepCompleted && Time.time - stepStartTime < step.timeout)
        {
            if (step.isCompleted)
            {
                Debug.Log($"[ExecuteTutorialStep] Step completed by player action: {step.stepName}");
                stepCompleted = true;
            }
            yield return null;
        }

        if (!stepCompleted)
        {
            // 可以选择自动完成或给出提示
            Debug.Log($"[ExecuteTutorialStep] Step timed out: {step.stepName}");
            step.isCompleted = true; 
        }

        Debug.Log($"[ExecuteTutorialStep] Triggering step completed: {step.stepName}");
        GameEvents.TriggerTutorialStepCompleted(step.stepName);
    }

    private void CompleteCurrentStep()
    {
        if (currentStepIndex < tutorialSteps.Count)
        {
            var currentStep = tutorialSteps[currentStepIndex];
            if (!currentStep.isCompleted)
            {
                currentStep.isCompleted = true;
                Debug.Log($"Step completed: {currentStep.stepName}");
            }
        }
    }

    public void CompleteTutorial()
    {
        if (tutorialCompleted) return;

        tutorialCompleted = true;
        GrantTutorialRewards();

        GameEvents.TriggerTutorialCompleted();
        PlayerPrefs.SetInt("TutorialCompleted", 1);
        PlayerPrefs.Save();
    }

    private void GrantTutorialRewards()
    {
        if (ExpSys.Instance != null)
            ExpSys.Instance.AddExp(tutorialExpReward, "tutorial");
        else
            Debug.LogError("ExpSys instance not found!");

        if (CurrencySys.Instance != null)
            CurrencySys.Instance.AddCurrency(tutorialCurrencyReward, "tutorial");
        else
            Debug.LogError("CurrencySys instance not found!");

        if (SkillManager.Instance != null)
        {
            SkillManager.Instance.UnlockSkill("double_jump");
        }

        if (GameProgressManager.Instance != null)
        {
            GameProgressManager.Instance.CompleteTutorial();
        }
    }

    // 手动触发教程步骤完成
    // 供其他系统调用
    public void CompleteTutorialStep(string stepName)
    {
        var step = tutorialSteps.Find(s => s.stepName == stepName);
        if (step != null && !step.isCompleted)
        {
            step.isCompleted = true;
            GameEvents.TriggerTutorialStepCompleted(stepName);
        }
    }

    private void OnDestroy()
    {
        GameEvents.OnPlayerAction -= OnPlayerAction;

        if (tutorialCoroutine != null)
            StopCoroutine(tutorialCoroutine);

        if (currentStepCoroutine != null)
            StopCoroutine(currentStepCoroutine);
    }

    public bool ShouldStartTutorial()
    {
        return !PlayerPrefs.HasKey("TutorialCompleted");
    }

    public void ResetTutorial()
    {
        tutorialCompleted = false;
        currentStepIndex = 0;

        foreach (var step in tutorialSteps)
        {
            step.isCompleted = false;
        }

        PlayerPrefs.DeleteKey("TutorialCompleted");
    }

    [ContextMenu("Skip Tutorial")]
    public void SkipTutorial()
    {
        if (tutorialCoroutine != null)
            StopCoroutine(tutorialCoroutine);

        CompleteTutorial();
        Debug.Log("Tutorial skipped");
    }
}