using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Ability_Dash : Ability_Base
{
    [Header("冲刺基础设置")]
    public float dashDistance = 3f;          
    public float dashSpeed = 40f;           
    public float dashCooldown = 1f;          
    public bool keepMomentum = true;        
    public bool autoFaceDirection = true;    

    [Header("输入设置")]
    public KeyCode dashKey = KeyCode.LeftShift;

    [Header("视觉效果")]
    public AudioClip dashSound;              

    private float nextDashTime = 0f;
    private Vector3 dashDirection;
    private float currentDashDistance;
    private bool isDashing = false;
    private Coroutine dashCoroutine;
    private const float directionThreshold = 0.05f;

    public bool IsDashing => isDashing;
    public float CooldownProgress => Mathf.Clamp01(1f - (nextDashTime - Time.time) / dashCooldown);
    public bool CanDash => Time.time >= nextDashTime &&
                          character.characterCondition.CurrentState == CharacterStates.CharacterCondition.Normal;

    protected override void UseInput()
    {
        if (Input.GetKeyDown(dashKey) && CanDash)
        {
            StartDash();
        }
    }

    public void StartDash()
    {
        if (!CanDash) return;

        character.movementState.ChangeState(CharacterStates.MovementStates.Dash);
        isDashing = true;
        CalculateDashDirection();
        nextDashTime = Time.time + dashCooldown;
        currentDashDistance = 0f;
        GameEvents.TriggerPlayerAction("dash");
        if (dashCoroutine != null)
            StopCoroutine(dashCoroutine);

        dashCoroutine = StartCoroutine(DashRoutine());
        PlayDashEffects();
    }

    private IEnumerator DashRoutine()
    {
        Vector3 startPosition = transform.position;
        core.SetEnableGravity(false);
        while (currentDashDistance < dashDistance &&
               isDashing &&
               character.movementState.CurrentState == CharacterStates.MovementStates.Dash)
        {
            Vector3 movement = dashDirection * dashSpeed * Time.deltaTime;
            core.SetVelocity(new Vector3(movement.x, 0, movement.z));
            currentDashDistance = Vector3.Distance(startPosition, transform.position);

            yield return null;
        }
        EndDash();
    }

    private void CalculateDashDirection()
    {
        if (character.currentFaceDir == Character.FaceDir.Left)
        {
            dashDirection = Vector3.left;
        }
        else
        {
            dashDirection = Vector3.right;
        }

        if (autoFaceDirection)
        {
            AdjustCharacterFacing();
        }
    }

    private void AdjustCharacterFacing()
    {
        if (Mathf.Abs(dashDirection.x) > directionThreshold)
        {
            bool shouldFaceLeft = dashDirection.x < 0;
            bool currentlyFacingLeft = character.currentFaceDir == Character.FaceDir.Left;

            if (shouldFaceLeft != currentlyFacingLeft)
            {
                character.Flip();
            }
        }
    }
    private void EndDash()
    {
        isDashing = false;
        core.SetEnableGravity(true);

        if (!keepMomentum)
        {
            core.SetVelocity(new Vector3(0, core.Velocity.y, 0));
        }

        if (character.movementState.CurrentState == CharacterStates.MovementStates.Dash)
        {
            if (core.controllerState.IsGrounded)
            {
                character.movementState.ChangeState(CharacterStates.MovementStates.Idle);
            }
            else
            {
                character.movementState.ChangeState(CharacterStates.MovementStates.Fall);
            }
        }

        dashCoroutine = null;
    }
    public void InterruptDash()
    {
        if (isDashing)
        {
            if (dashCoroutine != null)
                StopCoroutine(dashCoroutine);

            EndDash();
        }
    }
    private void PlayDashEffects()
    {
        if (dashSound != null)
        {
            AudioSource.PlayClipAtPoint(dashSound, transform.position);
        }
    }

    public void ResetCooldown()
    {
        nextDashTime = 0f;
    }
    public void Dash(Vector3 direction, float customDistance = -1, float customSpeed = -1)
    {
        if (!CanDash) return;

        dashDirection = direction.normalized;
        if (customDistance > 0) dashDistance = customDistance;
        if (customSpeed > 0) dashSpeed = customSpeed;

        StartDash();

        if (customDistance > 0) dashDistance = 3f;
        if (customSpeed > 0) dashSpeed = 40f;
    }

    public override void Execute()
    {
        base.Execute();

        if (isDashing && character.characterCondition.CurrentState != CharacterStates.CharacterCondition.Normal)
        {
            InterruptDash();
        }
    }
}