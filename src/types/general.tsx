import * as React from 'react';



type StateTuple<T> = {
	get : T,
	set : React.Dispatch<React.SetStateAction<T>>
}

type TransitionTuple = {
	busy : boolean,
	start : React.TransitionStartFunction
}

type SuccessResult = {
	success: boolean
}

type SuccessMessageResult = {
	success: boolean,
	message: string
}

type PersistedEntity = {
	persistId: number
}

type PersistedMultiEntities = {
	categoryId: number,
	patternId: number,
	transactionId: number
}

type AutocompleteField = {
	select: string | null,
	input: string
};



function newStateTuple<T>(state : T, setter : React.Dispatch<React.SetStateAction<T>>) : StateTuple<T> {
	let tuple : StateTuple<T> = {
		get : state,
		set : setter
	};

	return tuple;
}

function newTransitionTuple(state: boolean, starter : React.TransitionStartFunction) {
	let tuple : TransitionTuple = {
		busy : state,
		start : starter
	};

	return tuple;
}


export type { StateTuple, TransitionTuple, SuccessResult, SuccessMessageResult, PersistedEntity, PersistedMultiEntities, AutocompleteField };
export { newStateTuple, newTransitionTuple };
