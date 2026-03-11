import React from "react";

import Typography from "@mui/material/Typography";
import { newStateTuple, StateTuple } from "@/types/general";



class MessageState {
    message: StateTuple<string>;
    colour: StateTuple<string>;

    constructor() {
        const [messageText, setMessageText] = React.useState<string>("");
        const [messageColour, setMessageColour] = React.useState<string>("success");

        this.message = newStateTuple<string>(messageText, setMessageText),
        this.colour = newStateTuple<string>(messageColour, setMessageColour)
    }

    setMessage(message: string, colour?: string) {
        this.message.set(message);
        this.colour.set(colour ? colour : "success");
    }
}



function StatusMessage(props: { state: MessageState }) {
    const state = props.state;

    return (
    	<Typography color={state.colour.get}>{state.message.get}</Typography>
    );
}



export { StatusMessage, MessageState };
