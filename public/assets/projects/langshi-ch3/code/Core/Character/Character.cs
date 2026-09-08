using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Character : MonoBehaviour
{
    [Header("受伤设置")]
    public float hurtForce = 10f;
    public float hurtDuration = 0.5f; 
    public Color hurtColor = Color.red; 

    private bool isInjured = false; 
    private CharacterController characterController;
    private SpriteRenderer spriteRenderer;
    private Color originalColor;
    private Vector3 knockbackVelocity;
    private CharacterAnimatorController aniController;
    protected Ability_Base[] abilities;
    public LayerMask enemyLayerMask;
    public enum FlipType
    {
        SpriteFlip,
        ModelRotate
    }
    public enum FaceDir
    {
        Left, Right
    }

    public Transform Model;
    public FaceDir currentFaceDir;
    public FlipType flipType = FlipType.ModelRotate;

    public ToolStateMachine<CharacterStates.MovementStates> movementState;
    public ToolStateMachine<CharacterStates.CharacterCondition> characterCondition;

    private Coroutine hitStunCoroutine;
    private Coroutine reloadCoroutine;
    public Core core { get; private set; }

     void Awake()
    {
        enemyLayerMask = LayerMask.GetMask("Enemy");
        aniController = GetComponent<CharacterAnimatorController>();
        Init();

    }

    void Update()
    {
        UpdateAnimationParameters();
        EveryFrame();
        if (core.controllerState.IsJumping)
        {
            aniController.SetIsJumping(true);
        }
        else
        {
            aniController.SetIsJumping(false);
        }
        if (isInjured)
        {
            characterController.Move(knockbackVelocity * Time.deltaTime);
            knockbackVelocity = Vector3.Lerp(knockbackVelocity,Vector3.zero, 5f*Time.deltaTime);
        }
    }

    void UpdateAnimationParameters()
    {
        aniController.SetIsOnGround(core.controllerState.IsGrounded);
        aniController.SetXVelocity(Mathf.Abs(core.Velocity.x));
        aniController.SetZVelocity(Mathf.Abs(core.Velocity.z));
        aniController.SetYVelocity(core.Velocity.y);
        aniController.SetIsInjured(isInjured);
    }
    public void GetHurtFromPosition(Vector3 attackSourcePosition)
    {
        // 检查是否受伤或已死亡
        // 问题是，这里真的是管理玩家受击动画的脚本吗？我不确定。（水门汀）
        if (isInjured || (PlayerHPController.Instance != null && PlayerHPController.Instance.IsDead)) return;
        isInjured = true;
        Vector3 direction = (transform.position - attackSourcePosition).normalized;
        direction.y = Mathf.Abs(direction.y) > 0.3f ? direction.y : 0.5f;
        knockbackVelocity = direction.normalized * hurtForce;
        StartCoroutine(ResetHurtState());
    }
    public void GetHurt(ControllerColliderHit hit)
    {
        // 碰撞触发，比如环境伤害等
    }
    public void OnHurtFlashStart()
    {
        StartCoroutine(HurtFlashEffect());
    }
    public void OnHurtFlashEnd()
    {
        spriteRenderer.color = originalColor;
    }
    private IEnumerator HurtFlashEffect()
    {
        int flashCount = 3;
        float flashInterval = hurtDuration / (flashCount * 2);

        for (int i = 0; i < flashCount; i++)
        {
            spriteRenderer.color = hurtColor;
            yield return new WaitForSeconds(flashInterval);
            spriteRenderer.color = originalColor;
            yield return new WaitForSeconds(flashInterval);
        }
        spriteRenderer.color = originalColor;
    }

    private IEnumerator ResetHurtState()
    {
        yield return new WaitForSeconds(hurtDuration);
        isInjured = false;
        knockbackVelocity = Vector3.zero; 
    }
    private bool IsEnemy(GameObject obj)
    {
        return (enemyLayerMask.value & (1 << obj.layer)) != 0;
    }
    private void GetHurtFromHit(ControllerColliderHit hit)
    {
        if (isInjured) return;
        isInjured = true;
        Vector3 direction = (transform.position - hit.point).normalized;
        direction.y = Mathf.Abs(direction.y) > 0.3f ? direction.y : 0.5f;
        knockbackVelocity = direction.normalized * hurtForce;
        StartCoroutine(HurtFlashEffect());
        StartCoroutine(ResetHurtState());
    }

    protected virtual void Init()
    {
        core = GetComponent<Core>();
        characterController = GetComponent<CharacterController>();
        spriteRenderer = GetComponent<SpriteRenderer>();
        originalColor = spriteRenderer.color;
        movementState = new ToolStateMachine<CharacterStates.MovementStates>(gameObject, false);
        characterCondition = new ToolStateMachine<CharacterStates.CharacterCondition>(gameObject, false);
        abilities = GetComponentsInChildren<Ability_Base>();
        if (Model == null)
            Model = transform;
        currentFaceDir = FaceDir.Right;
        movementState.ChangeState(CharacterStates.MovementStates.Idle);
        characterCondition.ChangeState(CharacterStates.CharacterCondition.Normal);
        GameEvents.TriggerPlayerSpawn(this);
    }
    public bool CanPerformAction()
    {
        return characterCondition.CurrentState != CharacterStates.CharacterCondition.Dead &&
               characterCondition.CurrentState != CharacterStates.CharacterCondition.Stunned;
    }

    public void StartReload(float reloadDuration)
    {
        if (characterCondition.CurrentState == CharacterStates.CharacterCondition.Dead ||
            characterCondition.CurrentState == CharacterStates.CharacterCondition.Stunned)
            return;
        if (reloadCoroutine != null)
            StopCoroutine(reloadCoroutine);

        reloadCoroutine = StartCoroutine(CompleteReload(reloadDuration));
    }

    private IEnumerator CompleteReload(float duration)
    {
        yield return new WaitForSeconds(duration);

        // 这里可以添加弹药补充逻辑
    }

    public void CancelReload()
    {
            if (reloadCoroutine != null)
            {
                StopCoroutine(reloadCoroutine);
                reloadCoroutine = null;
            }
    }

    public void StartHitStun(float stunDuration)
    {
        if (characterCondition.CurrentState == CharacterStates.CharacterCondition.Dead)
            return;

        CancelReload();
        characterCondition.ChangeState(CharacterStates.CharacterCondition.Stunned);

        if (core != null)
        {
            core.SetVelocityXZ(0, 0);
        }

        if (hitStunCoroutine != null)
            StopCoroutine(hitStunCoroutine);

        hitStunCoroutine = StartCoroutine(RecoverFromHitStun(stunDuration));
    }

    private IEnumerator RecoverFromHitStun(float duration)
    {
        yield return new WaitForSeconds(duration);

        if (characterCondition.CurrentState == CharacterStates.CharacterCondition.Stunned)
        {
            characterCondition.ChangeState(CharacterStates.CharacterCondition.Normal);
        }
    }

    public void StartAttack()
    {
        if (!CanPerformAction()) return;
    }
    protected virtual void EveryFrame()
    {
        PreExecute();
        Execute();
        AfterExecute();
        OtherExecute();
        UpdateStateMachine();
    }

    protected virtual void PreExecute()
    {
        if (abilities != null)
        {
            foreach (Ability_Base ability in abilities)
            {
                if (ability.Initialised && ability.enabled)
                    ability.PreExecute();
            }
        }
    }

    protected virtual void Execute()
    {
        foreach (Ability_Base ability in abilities)
        {
            if (ability.Initialised && ability.enabled)
                ability.Execute();
        }
    }

    protected virtual void AfterExecute()
    {
        foreach (Ability_Base ability in abilities)
        {
            if (ability.Initialised && ability.enabled)
                ability.AfterExecute();
        }
    }

    protected virtual void OtherExecute()
    {

    }

    public void Die()
    {
        if (characterCondition.CurrentState == CharacterStates.CharacterCondition.Dead)
            return;
        characterCondition.ChangeState(CharacterStates.CharacterCondition.Dead);

        GameEvents.TriggerPlayerDeath(this);
    }

    public void Flip()
    {
        if (currentFaceDir == FaceDir.Left)
        {
            currentFaceDir = FaceDir.Right;
        }
        else
        {
            currentFaceDir = FaceDir.Left;
        }
    }

    protected virtual void UpdateStateMachine()
    {
        if (core != null)
        {
            if (core.controllerState.IsGrounded)
            {
                Vector3 horizontalVelocity = new Vector3(core.Velocity.x, 0, core.Velocity.z);
                if (horizontalVelocity.magnitude > 0.1f)
                {
                    movementState.ChangeState(CharacterStates.MovementStates.Walk);
                }
                else
                {
                    movementState.ChangeState(CharacterStates.MovementStates.Idle);
                }
            }
            else
            {
                if (core.Velocity.y > 0)
                {
                    movementState.ChangeState(CharacterStates.MovementStates.Jump);
                }
                else
                {
                    movementState.ChangeState(CharacterStates.MovementStates.Fall);
                }
            }
        }
    }
}