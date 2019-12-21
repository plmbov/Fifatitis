import React, { Component } from 'react'
import classes from './AddGameScore.module.css'
import Button from '../UI/Button/Button'
import InputGoals from '../InputGoals/InputGoals'
import axios from '../../axiosInstance'
import PopUp from '../UI/PopUp/PopUp'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import fadeTransition from '../../transitions/fade.module.css'

export class AddGameScore extends Component {

    state = {
        Bojo: 0,
        Maciek: 0,
        winner: null,
        popUpShown: false,
        resultSubmitted: false
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.Bojo !== this.state.Bojo || prevState.Maciek !== this.state.Maciek) {
            if (this.state.Bojo > this.state.Maciek) {
                this.setState({ winner: 'Bojo' })
            } else if (this.state.Bojo < this.state.Maciek) {
                this.setState({ winner: 'Maciek' })
            } else {
                this.setState({ winner: null })
            }
        }
    }


    submitResult = () => {

        if (this.props.user) {
            if (this.state.winner == null) {
                this.setState({ popUpShown: true })
            } else {
                this.sendToServer()
            }
        } else {
            this.setState({ popUpShown: true })
        }

    }

    sendToServer = () => {

        const d = new Date()

        const currentDateFormatted = ("0" + d.getDate()).slice(-2) + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" +
            d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);

        const result = {
            Bojo: this.state.Bojo,
            Maciek: this.state.Maciek,
            winner: this.state.winner,
            dateAndTime: currentDateFormatted
        }

        const currentYear = result.dateAndTime.slice(6, 10)
        const currentMonth = result.dateAndTime.slice(3, 5)


        axios.post(`results/${currentYear}/${currentMonth}.json`, result)
            .then(this.setState({ Bojo: 0, Maciek: 0, winner: null, popUpShown: true, resultSubmitted: true }))
    }

    increaseScoredGoals = (playerName) => {
        this.setState({ [playerName]: this.state[playerName] + 1 })
    }

    decreaseScoredGoals = (playerName) => {
        if (this.state[playerName] > 0) {
            this.setState({ [playerName]: this.state[playerName] - 1 })
        }
    }

    closePopUp = () => {
        this.setState({ popUpShown: false, resultSubmitted: false })
    }

    wonInPenalties = (penaltiesWinner) => {
        this.setState({ winner: penaltiesWinner, resultSubmitted: true },
            () => {
                this.sendToServer()
            })
    }

    render() {

        let popUp = null

        if (!this.props.user) {
            popUp = <PopUp isShown={this.state.popUpShown} closePopUp={this.closePopUp}>
                <p>Sorry, only authenticated users can add new game scores.</p>
                <Button clicked={this.closePopUp}
                    style={{ 'transform': 'scale(0.5)', 'width': '250px', 'margin': '0 auto' }}
                >OK</Button>
            </PopUp>
        }
        if (this.state.popUpShown && !this.state.resultSubmitted && this.props.user) {
            popUp = <PopUp isShown={this.state.popUpShown} closePopUp={this.closePopUp}>
                Who won in penalties?
                <div style={{ 'margin': '10px 0 15px 0' }}>
                    <Button clicked={() => this.wonInPenalties('Bojo')}>BOJO</Button>
                </div>
                <Button clicked={() => this.wonInPenalties('Maciek')}>MACIEK</Button>
            </PopUp>
        }
        if (this.state.popUpShown && this.state.resultSubmitted && this.props.user) {
            popUp = <PopUp isShown={this.state.popUpShown} closePopUp={this.closePopUp}>
                <p>The result has been successfully submitted!</p>
                <Button clicked={this.closePopUp}
                    style={{ 'transform': 'scale(0.5)', 'width': '250px', 'margin': '0 auto' }}
                >OK</Button>
            </PopUp>
        }


        return (
            <div className={classes.Container}>
                <TransitionGroup>
                    <CSSTransition
                        key={this.state.popUpShown}
                        timeout={200}
                        classNames={fadeTransition}
                    >
                        <div className={classes.PopUp}>
                            {popUp}
                        </div>
                    </CSSTransition>
                </TransitionGroup>
                <div className={classes.NamesAndGoals}>
                    <div className={classes.PlayerName}>
                        <InputGoals
                            playerName='BOJO'
                            goals={this.state.Bojo}
                            increase={() => this.increaseScoredGoals('Bojo')}
                            decrease={() => this.decreaseScoredGoals('Bojo')}
                        />
                    </div>
                    <div className={classes.PlayerName}>
                        <InputGoals
                            playerName='MACIEK'
                            goals={this.state.Maciek}
                            increase={() => this.increaseScoredGoals('Maciek')}
                            decrease={() => this.decreaseScoredGoals('Maciek')}
                        />
                    </div>
                </div>
                <div className={classes.Button}>
                    <Button clicked={this.submitResult} >SUBMIT RESULT</Button>
                </div>
            </div>
        )
    }
}

export default AddGameScore