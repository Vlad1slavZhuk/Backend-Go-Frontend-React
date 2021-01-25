import Header from './components/Header';
import React from 'react';
import { WITHOUT_MODAL } from './constants';
import { isLoggedInChanged } from './services/account';
import CarsTable from './components/CarsTable';
import SignInModal from './components/modals/SignInModal';
import SignUpModal from './components/modals/SignUpModal';

class App extends React.Component {
  constructor() {
    super();

    const accountToken = localStorage.getItem('Token');

    this.state = {
      isLoggedIn: accountToken !== null,
      displayModalType: WITHOUT_MODAL
    };
  }

  handleDisplayModalTypeChaged = displayModalType => this.setState({ displayModalType });
  handleModalClose = () => this.setState({ displayModalType: WITHOUT_MODAL });

  componentDidMount() {
    this.isLoggedInChangedSubscriber = isLoggedInChanged.subscribe(isLoggedIn => this.setState({ isLoggedIn }));
  }

  componentWillUnmount() {
    this.isLoggedInChangedSubscriber.unsubscribe();
  }

  render() {
    const {
      isLoggedIn,
      displayModalType
    } = this.state;

    return (
      <div>
        <Header isLoggedIn={isLoggedIn} onDisplayModalTypeChaged={this.handleDisplayModalTypeChaged} />

        { isLoggedIn && <CarsTable
          displayModalType={displayModalType}
          onDisplayModalTypeChaged={this.handleDisplayModalTypeChaged}
          onModalClose={this.handleModalClose}></CarsTable>}

        <SignInModal displayModalType={displayModalType} onModalClose={this.handleModalClose}></SignInModal>
        <SignUpModal displayModalType={displayModalType} onModalClose={this.handleModalClose}></SignUpModal>
      </div>
    )
  }
}

export default App;