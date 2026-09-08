using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Ability_Move : Ability_Base
{
    private CharacterAnimatorController animatorController;

    private Vector3 moveDirection;
    private bool isJumping;
    private float targetAngle;
    private float currentAngle;
    private const float LerpValue = 0.1f;

    protected override void Init()
    {
        base.Init();
        animatorController = character.GetComponent<CharacterAnimatorController>();
    }
    protected override void UseInput()
    {
        float XVelocity = Mathf.Abs(Xinput);
        float ZVelocity = Mathf.Abs(Zinput);

        animatorController.SetXVelocity(XVelocity);
        animatorController.SetZVelocity(ZVelocity);

        HandleMovement();
        HandleJump();
        HandleRotation();
        if (core.controllerState.IsGrounded)
        {
            animatorController.SetIsOnGround(true);
        }
        else
        {
            animatorController.SetIsOnGround(false);
        }
    }

    void HandleMovement()
    {
        moveDirection = new Vector3(Xinput, 0, Zinput).normalized;

        if (moveDirection.magnitude > 0.1f)
        {
            GameEvents.TriggerPlayerAction("moved");
        }

        if (character.movementState.CurrentState == CharacterStates.MovementStates.Dash)
        {
            return;
        }

        float currentSpeed = core.CurrentControllerParams.MoveSpeed;
        if (!core.controllerState.IsGrounded)
        {
            currentSpeed *= core.CurrentControllerParams.AirControl;
        }

        core.SetVelocityXZ(moveDirection.x * currentSpeed, moveDirection.z * currentSpeed);
        Vector3 targetVelocity = moveDirection * currentSpeed;

        if (character.characterCondition.CurrentState == CharacterStates.CharacterCondition.Dead)
        {
            core.SetVelocityXZ(0, 0);
            return;
        }

        if (character.characterCondition.CurrentState == CharacterStates.CharacterCondition.Stunned)
        {
            core.SetVelocityXZ(0, 0);
            return;
        }
    }
    void HandleJump()
    {
        if (jumpInput && core.controllerState.IsGrounded)
        {
            core.Jump(core.CurrentControllerParams.JumpForce);
            core.controllerState.IsJumping = true;
            isJumping = true;
        }

        if (core.controllerState.IsGrounded && isJumping)
        {
            isJumping = false;
            core.controllerState.IsJumping = false;
        }
    }

    void HandleRotation()
    {
        if (Mathf.Abs(Xinput) > 0.1f)
        {
            UpdateFaceDirection(Xinput);
        }

        SmoothRotateToTarget();
    }

    void UpdateFaceDirection(float xInput)
    {
        if (xInput > 0.1f)
        {
            targetAngle = 0f;
            character.currentFaceDir = Character.FaceDir.Right;
        }
        else if (xInput < -0.1f)
        {
            targetAngle = 180f;
            character.currentFaceDir = Character.FaceDir.Left;
        }
    }

    void SmoothRotateToTarget()
    {
        if (character.Model != null)
        {
            currentAngle = Mathf.LerpAngle(character.Model.eulerAngles.y, targetAngle, LerpValue);

            Vector3 newRotation = character.Model.eulerAngles;
            newRotation.y = currentAngle;
            character.Model.eulerAngles = newRotation;
        }
    }

}