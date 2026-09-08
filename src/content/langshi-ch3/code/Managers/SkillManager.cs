using System.Collections.Generic;
using UnityEngine;

public class SkillManager : MonoBehaviour
{
    public static SkillManager Instance;

    [System.Serializable]
    public class SkillData
    {
        public string skillId;
        public string skillName;
        public string description;
        public bool isUnlocked;
        public int requiredLevel;
    }

    public List<SkillData> skills = new List<SkillData>();

    public event System.Action<string> OnSkillUnlocked;

    private void Awake()
    {
        if (Instance == null)
        {
            Instance = this;
            DontDestroyOnLoad(gameObject);
            InitializeSkills();
        }
        else
        {
            Destroy(gameObject);
        }
    }

    private void InitializeSkills()
    {
        // 初始化技能列表
        skills = new List<SkillData>
        {
            new SkillData { skillId = "double_jump", skillName = "二段跳", description = "允许在空中再次跳跃", requiredLevel = 1 },
            new SkillData { skillId = "dash_ability", skillName = "冲刺", description = "快速向前冲刺一段距离", requiredLevel = 2 },
            new SkillData { skillId = "wall_jump", skillName = "蹬墙跳", description = "可以在墙上跳跃", requiredLevel = 3 }
        };
    }

    public void UnlockSkill(string skillId)
    {
        var skill = skills.Find(s => s.skillId == skillId);
        if (skill != null && !skill.isUnlocked)
        {
            skill.isUnlocked = true;
            OnSkillUnlocked?.Invoke(skillId);
            GameEvents.TriggerContentUnlocked(skillId);
            // 激活对应的技能组件
            ActivateSkillComponent(skillId);
        }
    }

    public bool IsSkillUnlocked(string skillId)
    {
        var skill = skills.Find(s => s.skillId == skillId);
        return skill?.isUnlocked ?? false;
    }

    private void ActivateSkillComponent(string skillId)
    {
        switch (skillId)
        {
            case "double_jump":
                var player = FindObjectOfType<Character>();
                if (player != null)
                {
                    var jumpAbility = player.GetComponent<Ability_Jump>();
                    if (jumpAbility != null)
                    {
                        jumpAbility.JumpNum = 2; 
                    }
                }
                break;
        }
    }

    public void ResetSkills()
    {
        foreach (var skill in skills)
        {
            skill.isUnlocked = false;
        }
    }
}