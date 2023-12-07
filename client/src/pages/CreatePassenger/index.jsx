/* eslint-disable jsx-a11y/label-has-associated-control */
import { useDispatch } from 'react-redux';

import { useNavigate } from 'react-router-dom';
import BackBtn from '@components/BackBtn';
import { useState } from 'react';
import toast from 'react-hot-toast';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './custom.css';

import { Button } from '@mui/material';
import { createPassenger } from './actions';

import classes from './style.module.scss';

const CreatePassenger = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    gender: '',
    dateOfBirth: '',
    idCard: '',
    name: '',
    email: '',
  });

  const handleInputChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateIdCard = () => {
    if (!inputs.idCard) {
      toast.error('You must insert ID Card');
      return false;
    }
    if (inputs.idCard.length !== 16 || !/^\d+$/.test(inputs.idCard)) {
      toast.error('Incorrect ID Card format');
      return false;
    }

    return true;
  };

  const validateEmail = () => {
    if (!inputs.email) {
      return true;
    }

    if (!/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(inputs.email)) {
      toast.error('Incorrect E-mail format');
      return false;
    }

    return true;
  };

  const handleFocusOut = (e) => {
    if (e.target.name === 'idCard') {
      validateIdCard();
    }

    if (e.target.name === 'email') {
      validateEmail();
    }
  };

  const validateInputs = () => {
    if (!validateIdCard()) return false;
    if (!validateEmail()) return false;
    return true;
  };

  const handleSuccess = () => {
    toast.success('Success create passenger');
    navigate('/myPassengers');
  };

  const handleError = (errorMsg) => {
    toast.error(errorMsg);
  };

  const handleSubmit = () => {
    if (!validateInputs()) return;

    const formattedInputs = { ...inputs };
    formattedInputs.dateOfBirth = new Date(inputs.dateOfBirth).toDateString();

    if (!inputs.email) delete formattedInputs.email;

    dispatch(createPassenger(formattedInputs, handleSuccess, handleError));
  };

  return (
    <main className={classes.main}>
      <div className={classes.container}>
        <header>
          <BackBtn handleClickBack={() => navigate('/myPassengers')} />
          <h1>Create Passenger</h1>
        </header>

        <form>
          <div className={classes.header}>Personal Information</div>
          <div className={classes.input}>
            <label htmlFor="gender">Gender</label>
            <div className={classes.radios}>
              <div className={classes.radio} onClick={() => setInputs((prev) => ({ ...prev, gender: 'Male' }))}>
                <input
                  type="radio"
                  name="gender"
                  value="Male"
                  checked={inputs.gender === 'Male'}
                  onChange={handleInputChange}
                />
                <label>Male</label>
              </div>
              <div className={classes.radio} onClick={() => setInputs((prev) => ({ ...prev, gender: 'Female' }))}>
                <input
                  type="radio"
                  name="gender"
                  value="Female"
                  checked={inputs.gender === 'Female'}
                  onChange={handleInputChange}
                />
                <label>Female</label>
              </div>
            </div>
          </div>
          <div className={classes.input}>
            <label htmlFor="dateOfBirth">Date of birth</label>
            <DatePicker
              name="dateOfBirth"
              placeholderText="Select your date of birth"
              selected={inputs.dateOfBirth}
              showMonthDropdown
              dropdownMode="select"
              showYearDropdown
              dateFormat="dd/MM/yyyy"
              className={classes.datePicker}
              onChange={(date) => setInputs((prev) => ({ ...prev, dateOfBirth: date }))}
            />
          </div>

          <div className={classes.header}>Certificate Information</div>
          <div className={classes.input}>
            <label htmlFor="idCard">ID Card</label>
            <input
              type="text"
              name="idCard"
              id="idCard"
              value={inputs.idCard}
              onChange={handleInputChange}
              onBlur={handleFocusOut}
              placeholder="Please enter Indonesia ID card"
              autoComplete="off"
            />
          </div>
          <div className={classes.input}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              name="name"
              id="name"
              value={inputs.name}
              onChange={handleInputChange}
              placeholder="Enter the name on your ID Card"
              autoComplete="off"
            />
          </div>

          <div className={classes.header}>Contact Information</div>
          <div className={classes.input}>
            <label htmlFor="email">E-mail</label>
            <input
              type="text"
              name="email"
              id="email"
              value={inputs.email}
              onChange={handleInputChange}
              onBlur={handleFocusOut}
              placeholder="(Optional) Enter the email address"
              autoComplete="off"
            />
          </div>
        </form>

        <div className={classes.buttons}>
          <Button variant="contained" className={classes.submit} onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </main>
  );
};

export default CreatePassenger;
