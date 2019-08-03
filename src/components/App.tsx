import * as React from 'react'
// import {Container, Col, Row} from 'react-bootstrap'

import "../styles/index.css"

export interface PropsInterface { name: String, version: String }

const useInterval = (callback: any, delay: number) => {
    const savedCallback: any = React.useRef();

    // Remember the latest callback.

    React.useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);
    // Set up the interval.
    React.useEffect(() => {
        function tick() {
            console.log('tick')
            savedCallback.current()
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

interface StateInterface {
    minutes: number;
    seconds: number;
}

const SET_MINUTES = 'SET_MINUTES'
const SET_SECONDS = 'SET_SECONDS'

interface SystemActionType {
    type: typeof SET_MINUTES | typeof SET_SECONDS
    payload: Object
}

const initial_state: StateInterface = {
    minutes: 25,
    seconds: 60
}

const stateReducer = (state: StateInterface = initial_state, action: SystemActionType) => {
    switch (action.type) {
        case SET_MINUTES:
            return {...state, minutes: action.payload}
        case SET_SECONDS:
            return {...state, seconds: action.payload}
        default:
            return state;
    }
};

const App  = ( props: PropsInterface ) => {
    const [ breakLength, setBreakLength ] = React.useState(5)
    const [ sessionLength, setSessionLength ] = React.useState(25)
    const [ initialSeconds ] = React.useState(0)
    const [ breakSession, setBreakSession ] = React.useState(false)
    const [ start, setStart ] = React.useState(false)
    const [ sessionBegun, setSessionBegun ] = React.useState(false)
    const [ sessionTime, setSessionTime ] = React.useState(true)
    const [ menu, setMenu ] = React.useState(false)
    // @ts-ignore
    const [ state, dispatch ] = React.useReducer(stateReducer, initial_state)

    let internal_wait: Boolean = false

    useInterval((a:any,b:any,cc:any) => {
        if(internal_wait) return;

        if(start) {
            if(sessionTime) {
                setStart(true)
                setSessionBegun(true)
                setSessionTime(true)

                if(state.seconds > 0) {
                    if(state.seconds == 60)
                        dispatch({type: SET_MINUTES, payload: sessionLength - 1})
                    dispatch({type: SET_SECONDS, payload: state.seconds - 1})
                }




                if (state.seconds == 0 && state.minutes!==0) {
                    dispatch({type: SET_MINUTES, payload: state.minutes - 1})
                    dispatch({type: SET_SECONDS, payload: 59})
                } else if (state.seconds == 0 && state.minutes == 0 && sessionTime) {
                    const el = document.getElementById('beep') as HTMLAudioElement
                    el.play();
                    setSessionTime(false)
                    internal_wait = true

                    // start break interval
                    setTimeout(() => {
                        internal_wait = false;
                        setBreakSession(true)
                        dispatch({type: SET_MINUTES, payload: breakLength - 1})
                        dispatch({type: SET_SECONDS, payload: 60})
                    }, 2000);
                }
            }
            if(breakSession) {
                if(state.seconds > 0)
                    dispatch({type: SET_SECONDS, payload: state.seconds - 1})

                if (state.seconds == 0 && state.minutes!==0) {
                    dispatch({type: SET_MINUTES, payload: state.minutes - 1})
                    dispatch({type: SET_SECONDS, payload: 59})
                }

                if (state.minutes === 0 && state.seconds == 0 && !sessionTime) {
                    setBreakSession(false)
                    internal_wait = true
                    setTimeout(() => {
                        internal_wait = false
                        setSessionTime(true)
                        dispatch({type: SET_MINUTES, payload: sessionLength - 1})
                        dispatch({type: SET_SECONDS, payload: 60})
                    }, 2000);
                }
            }
        }
    }, 1000);

    const startTimer = () => {
        setStart(true)
    }

    const reset = () => {
        dispatch({type: SET_MINUTES, payload: 25})
        dispatch({type: SET_SECONDS, payload: 60})
        setBreakLength(5)
        setSessionLength(25)
        setBreakSession(false)
        setSessionBegun(false)
        setSessionTime(true)

        if (start) {
            setStart(false)
        }
        const el = document.getElementById('beep') as HTMLAudioElement
        el.pause();
        el.currentTime = 0;
    }
    // break length
    const breakInc = () => {
        setBreakLength(breakLength + 1)

        if (breakLength === 60) {
            setBreakLength(60)
        }
    }

    const breakDec = () => {
        setBreakLength(breakLength - 1)

        if (breakLength === 1) {
            setBreakLength(1)
        }

    }

    // session length

    const sessionInc = () => {
        setSessionLength(sessionLength + 1)
        dispatch({type: SET_MINUTES, payload: sessionLength + 1})
        dispatch({type: SET_SECONDS, payload: state.seconds})

        if (sessionLength === 60) {
            setSessionLength(60)
            dispatch({type: SET_SECONDS, payload: 60})
        }
    }

    const sessionDec = () => {
        setSessionLength(sessionLength - 1)
        dispatch({type: SET_MINUTES, payload: sessionLength - 1})
        dispatch({type: SET_SECONDS, payload: state.seconds})

        if (sessionLength === 1) {
            setSessionLength(1)
            dispatch({type: SET_SECONDS, payload: 1})
        }
    }

    const pause = () => {
        setStart(false)
        dispatch({type: SET_MINUTES, payload: state.minutes})
        dispatch({type: SET_SECONDS, payload: state.seconds})
        setSessionLength(sessionLength)
        setBreakLength(breakLength)

        stopSound()
    }
    const stopSound = () => {
        const el = document.getElementById('beep') as HTMLAudioElement
        el.pause()
        el.currentTime = 0
    }

    const showMenu = () => {
        const el = document.getElementById('controllers') as HTMLDivElement
        if (menu) {
            setMenu(false)
            el.style.right = '-15rem';
            el.style.transform = 'scaleX(0)';
        } else {
            setMenu(true)
            el.style.right = '0rem';
            el.style.padding = '5rem';
            el.style.transform = 'scaleX(1)';
        }
    }

        return (
            <div id="container">
                <div id="menu" onClick={showMenu}><i className="fas fa-bars" id="menu-icon" ></i></div>
                <h1>Pomodoro</h1>
                <div id="circle-container">
                    <div className="circle"></div>
                    <div className="circle"></div>
                    <div className="circle"></div>
                </div>
                <div id="controllers">
                    <div id="break-label">
                        <p id="break-title">Break</p>
                        <div id="break-increment" onClick={breakInc}><i className="fas fa-arrow-up arrow"></i></div>
                        <p id="break-length">{breakLength}</p>
                        <div id="break-decrement" onClick={breakDec}><i className="fas fa-arrow-down arrow"></i></div>
                    </div>
                    <div id="session-label">
                        <p id="session-title">Session</p>
                        <div id="session-increment" onClick={sessionInc}><i className="fas fa-arrow-up arrow"></i></div>
                        <p id="session-length">{
                            sessionLength }</p>
                        <div id="session-decrement" onClick={sessionDec}><i className="fas fa-arrow-down arrow"></i></div>
                    </div>
                </div>
                <div id="timer-label">
                    {!breakSession ? "Choose a job you love & you'll never have to work a day in your life." : "Break time"}
                    <div id="timer-title">
                        <p id="time-left">
                            {state.minutes < 10 ? '0' + state.minutes + ':' : state.minutes+':'}
                            {!sessionBegun ? '0' + initialSeconds : state.seconds}
                        </p>
                    </div>
                    <div id="buttons">
                        <div id="start_stop" onClick={!start ? startTimer : pause}>{start ? <i className="far fa-pause-circle pause"></i> : <i className="far fa-play-circle play"></i>}</div>
                        <div id="reset" onClick={reset}><i className="fas fa-power-off reset"></i>
                        </div>
                    </div>
                </div>
                <div id="sound">
                    <audio id="beep" src="" />
                </div>
            </div>
    )
}

export default App
