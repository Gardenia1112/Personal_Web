using UnityEngine;
using UnityEngine.UI;
using System.Collections; 
using System;
using System.Collections.Generic;
 
	public struct ToolStateChangeEvent<T> where T: struct, IComparable, IConvertible, IFormattable
	{
		public GameObject Target;
		public ToolStateMachine<T> TargetStateMachine;
		public T NewState;
		public T PreviousState;

		public ToolStateChangeEvent(ToolStateMachine<T> stateMachine)
		{
			Target = stateMachine.Target;
			TargetStateMachine = stateMachine;
			NewState = stateMachine.CurrentState;
			PreviousState = stateMachine.PreviousState;
		}
	}
 
	public interface MMIStateMachine
	{
		bool TriggerEvents { get; set; }
	}

 
	public class ToolStateMachine<T> : MMIStateMachine where T : struct, IComparable, IConvertible, IFormattable
	{
	 
		public bool TriggerEvents { get; set; } 
		public GameObject Target; 
		public T CurrentState { get; protected set; } 
		public T PreviousState { get; protected set; }
	 
		public ToolStateMachine(GameObject target, bool triggerEvents)
		{
			this.Target = target;
			this.TriggerEvents = triggerEvents;
		} 
	 
		public virtual void ChangeState(T newState)
		{ 
			if (newState.Equals(CurrentState))
			{
				return;
			}
			 
			PreviousState = CurrentState;
			CurrentState = newState;

		 
		}
	 
		public virtual void RestorePreviousState()
		{ 
			CurrentState = PreviousState;

		 
		}	
	} 