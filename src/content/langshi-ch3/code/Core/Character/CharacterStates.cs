using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CharacterStates
{
    public enum MovementStates
    {
        Null,
        Idle,
        Walk,
        Run,
        Fall,
        Jump,
        DoubleJump,
        Dash,
        Climbing,
        Swimming
    }

    public enum CharacterCondition
    {
        Normal,
        Frozen,
        Paused,
        Dead,
        ControlledMovement,
        Stunned,
        Attacking,
    }
}
