using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.TextCore.Text;

public class Ability_Jump : Ability_Base
{
    public enum JumpType
    {
        CanJump,
        CanJumpAnyWhere,
        CanJumpOnGround,
        CanJumpOnGroundAndFromLadders,
        CanJumpAnyWhereAnyNum,
    }

    [Header("ÌøÔ¾²ÎÊý")]
    public int JumpNum = 1;
    public float JumpHeight = 3f;
    public JumpType jumpType = JumpType.CanJumpAnyWhere;
    public bool IsExactJump = true;

    [Header("ÌøÔ¾ÅÐ¶¨")]
    public float jumpBufferTime = 0.15f;
    public float coyoteTime = 0.1f;

    [Header("×´Ì¬")]
    public int CurJumpNum;
    public bool JumpHappenedThisFrame;

    [Header("¾«È·ÌøÔ¾¿ØÖÆ")]
    public bool IsPressTimeForJumpHeight = true;
    public float ShortestTimeInAir = 0.1f;
    public float FloatFactor_ButtonRelease = 2f;

    private float jumpButtonPressTime;
    private bool jumpButtonPressed = false;
    private bool jumpButtonReleased = false;
    private float lastGroundTime;
    private float lastJumpInputTime = -10f;
    private bool wasGroundedLastFrame = false;
    private bool hasJumpedThisAirTime = false;
    private Animator animator;

    protected override void Init()
    {
        base.Init();
        CurJumpNum = JumpNum;
        hasJumpedThisAirTime = false;
        animator = character.GetComponent<Animator>();
    }

    protected override void UseInput()
    {
        if (Input.GetKeyDown(KeyCode.Space))
        {
            lastJumpInputTime = Time.time;
            TryJump();
        }

        if (Input.GetKeyUp(KeyCode.Space))
        {
            JumpStop();
        }
    }

    void TryJump()
    {
        if (!character.CanPerformAction() || (PlayerHPController.Instance != null && PlayerHPController.Instance.IsDead))
        {
            return;
        }

        if (CanJump() || HasBufferedJumpInput())
        {
            ExecuteJump();
        }
    }

    bool CanJump()
    {
        if (!IsJumpAuthorized())
            return false;

        if (character.characterCondition.CurrentState != CharacterStates.CharacterCondition.Normal &&
            character.characterCondition.CurrentState != CharacterStates.CharacterCondition.ControlledMovement)
            return false;

        if (character.movementState.CurrentState == CharacterStates.MovementStates.Dash)
            return false;

        if (jumpType != JumpType.CanJumpAnyWhereAnyNum && CurJumpNum <= 0)
            return false;

        return true;
    }

    bool HasBufferedJumpInput()
    {
        bool isBufferValid = (Time.time - lastJumpInputTime <= jumpBufferTime);
        bool isGrounded = core.controllerState.IsGrounded;
        bool isInCoyoteTime = (Time.time - lastGroundTime <= coyoteTime) && !isGrounded && wasGroundedLastFrame;
        return isBufferValid && (isGrounded || isInCoyoteTime);
    }

    bool IsJumpAuthorized()
    {
        switch (jumpType)
        {
            case JumpType.CanJumpAnyWhere:
            case JumpType.CanJumpAnyWhereAnyNum:
                return true;

            case JumpType.CanJumpOnGround:
                if (core.controllerState.IsGrounded) return true;
                if (IsExactJump && CurJumpNum > 0) return true;
                if (!IsExactJump && !hasJumpedThisAirTime) return true;
                return false;

            case JumpType.CanJumpOnGroundAndFromLadders:
                return core.controllerState.IsGrounded ||
                       character.movementState.CurrentState == CharacterStates.MovementStates.Climbing;

            case JumpType.CanJump:
            default:
                return core.controllerState.IsGrounded;
        }
    }

    void ExecuteJump()
    {
        bool isFirstJump = core.controllerState.IsGrounded || (Time.time - lastGroundTime <= coyoteTime && wasGroundedLastFrame);
        if (isFirstJump)
        {
            character.movementState.ChangeState(CharacterStates.MovementStates.Jump);
        }
        else
        {
            character.movementState.ChangeState(CharacterStates.MovementStates.DoubleJump);
        }
        animator.SetTrigger("Takeof");
        float jumpVelocity = CalculateJumpVelocity();
        core.SetYforce(jumpVelocity);
        core.SetEnableGravity(true);

        if (jumpType != JumpType.CanJumpAnyWhereAnyNum)
        {
            CurJumpNum--;
            hasJumpedThisAirTime = true;
        }

        JumpHappenedThisFrame = true;
        jumpButtonPressTime = Time.time;
        jumpButtonPressed = true;
        jumpButtonReleased = false;
        core.controllerState.IsJumping = true;

        lastJumpInputTime = -10f;
        string jumpAct = isFirstJump ? "jumped" : "double_jumped";
        GameEvents.TriggerPlayerAction(jumpAct);
    }


    float CalculateJumpVelocity()
    {
        float gravity = Mathf.Abs(core.CurrentControllerParams.Gravity);
        return Mathf.Sqrt(2f * gravity * JumpHeight);
    }

    void JumpStop()
    {
        if (!IsExactJump) return;

        jumpButtonPressed = false;
        jumpButtonReleased = true;
    }

    public override void Execute()
    {
        base.Execute();

        JumpHappenedThisFrame = false;

        if (core.controllerState.JustGotGrounded)
        {
            CurJumpNum = JumpNum;
            hasJumpedThisAirTime = false;
            wasGroundedLastFrame = true;
        }
        else
        {
            wasGroundedLastFrame = core.controllerState.IsGrounded;
        }

        if (core.controllerState.IsGrounded)
        {
            lastGroundTime = Time.time;
        }

        if (IsExactJump)
        {
            HandleExactJump();
        }
        UpdateJumpState();
    }

    void HandleExactJump()
    {
        if (jumpButtonPressTime != 0 &&
            Time.time - jumpButtonPressTime >= ShortestTimeInAir &&
            core.Velocity.y > 0 &&
            jumpButtonReleased &&
            !jumpButtonPressed)
        {
            jumpButtonReleased = false;

            if (IsPressTimeForJumpHeight)
            {
                jumpButtonPressTime = 0;

                if (FloatFactor_ButtonRelease == 0)
                {
                    core.SetYforce(0);
                }
                else
                {
                    core.SetYforce(core.Velocity.y / FloatFactor_ButtonRelease);
                }
            }
        }
    }

    void UpdateJumpState()
    {
        bool isJumping = character.movementState.CurrentState == CharacterStates.MovementStates.Jump ||
                        character.movementState.CurrentState == CharacterStates.MovementStates.DoubleJump;

        core.controllerState.IsJumping = isJumping;
    }

    public void ResetJump()
    {
        CurJumpNum = JumpNum;
        hasJumpedThisAirTime = false;
        jumpButtonPressed = false;
        jumpButtonReleased = false;
        jumpButtonPressTime = 0;
        lastJumpInputTime = -10f;
    }

    public bool CanJumpImmediate()
    {
        bool hasBufferedJump = (Time.time - lastJumpInputTime <= jumpBufferTime);

        bool inCoyoteTime = (Time.time - lastGroundTime <= coyoteTime) &&
                           !core.controllerState.IsGrounded &&
                           wasGroundedLastFrame;

        bool canJumpImmediate = IsJumpAuthorized();
        if (jumpType != JumpType.CanJumpAnyWhereAnyNum)
        {
            if (IsExactJump)
            {
                canJumpImmediate = canJumpImmediate && CurJumpNum > 0;
            }
            else
            {
                canJumpImmediate = canJumpImmediate && !hasJumpedThisAirTime;
            }
        }

        bool canJumpWithBuffer = hasBufferedJump && (core.controllerState.IsGrounded || inCoyoteTime);

        return canJumpImmediate || canJumpWithBuffer;
    }
}