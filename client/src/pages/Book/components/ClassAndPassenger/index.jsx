import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

import BackBtn from '@components/BackBtn';
import { formatDate, formatDateWithDay, formatHour, formatRupiah } from '@utils/handleValue';
import { getSchedule, setChosenSeats, setPassengerIds, setSchedule, setStep } from '@pages/Book/actions';
import arrowImage from '@static/images/arrowTrain.png';
import toast from 'react-hot-toast';
import { createStructuredSelector } from 'reselect';
import { selectMyPassengers, selectPassengerIds, selectSchedule } from '@pages/Book/selectors';

import { Button } from '@mui/material';
import { selectLocale } from '@containers/App/selectors';
import OptionCard from '../OptionCard';
import PassengerCard from '../PassengerCard';

import classes from './style.module.scss';

const ClassAndPassenger = ({ schedule, myPassengers, passengerIds, locale, intl: { formatMessage } }) => {
  const { scheduleId, seatClass } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const options = [
    {
      seatClass: 'first',
      price: formatRupiah(schedule?.prices.filter((schedulePrice) => schedulePrice.seatClass === 'first')[0].price),
      available: schedule?.firstSeatAvailable,
    },
    {
      seatClass: 'business',
      price: formatRupiah(schedule?.prices.filter((schedulePrice) => schedulePrice.seatClass === 'business')[0].price),
      available: schedule?.businessSeatAvailable,
    },
    {
      seatClass: 'economy',
      price: formatRupiah(schedule?.prices.filter((schedulePrice) => schedulePrice.seatClass === 'economy')[0].price),
      available: schedule?.economySeatAvailable,
    },
  ];

  const handleClickOption = (selectedSeatClass) => {
    navigate(`/book/${scheduleId}/${selectedSeatClass}`);

    if (selectedSeatClass === 'first') {
      if (schedule.firstSeatRemainder < passengerIds.length) {
        dispatch(setPassengerIds([]));
      }
    } else if (selectedSeatClass === 'business') {
      if (schedule.businessSeatRemainder < passengerIds.length) {
        dispatch(setPassengerIds([]));
      }
    } else if (selectedSeatClass === 'economy') {
      if (schedule.economySeatRemainder < passengerIds.length) {
        dispatch(setPassengerIds([]));
      }
    }
  };

  const handleClickCheckbox = (passengerId) => {
    if (passengerIds.includes(passengerId)) {
      dispatch(setPassengerIds(passengerIds.filter((itemId) => itemId !== passengerId)));
    } else {
      if (seatClass === 'first') {
        if (schedule.firstSeatRemainder === passengerIds.length) {
          toast.error(formatMessage({ id: 'app_reach_maximum_number_seats' }));
          return;
        }
      } else if (seatClass === 'business') {
        if (schedule.businessSeatRemainder === passengerIds.length) {
          toast.error(formatMessage({ id: 'app_reach_maximum_number_seats' }));
          return;
        }
      } else if (seatClass === 'economy') {
        if (schedule.economySeatRemainder === passengerIds.length) {
          toast.error(formatMessage({ id: 'app_reach_maximum_number_seats' }));
          return;
        }
      }

      dispatch(setPassengerIds([...passengerIds, passengerId].sort((a, b) => a - b)));
    }
  };

  const handleClickDelete = (passengerId) => {
    dispatch(setPassengerIds(passengerIds.filter((itemId) => itemId !== passengerId)));
  };

  const handleClickChooseSeat = () => {
    if (passengerIds.length === 0) {
      toast.error(formatMessage({ id: 'app_need_to_choose_passengers' }));
      return;
    }

    dispatch(setChosenSeats(new Map()));
    dispatch(setStep(1));
  };

  useEffect(() => {
    dispatch(getSchedule(scheduleId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleId]);

  useEffect(() => {
    if (
      schedule?.firstSeatAvailable === 'None' &&
      schedule?.businessSeatAvailable === 'None' &&
      schedule?.economySeatAvailable === 'None'
    ) {
      toast.error(formatMessage({ id: 'app_all_seats_are_booked' }));
      dispatch(setSchedule(null));
      return navigate('/');
    }

    if (seatClass === 'first' && schedule?.firstSeatAvailable === 'None') {
      if (schedule?.businessSeatAvailable !== 'None') {
        return navigate(`/book/${scheduleId}/business`);
      }
      return navigate(`/book/${scheduleId}/economy`);
    }

    if (seatClass === 'business' && schedule?.businessSeatAvailable === 'None') {
      if (schedule?.firstSeatAvailable !== 'None') {
        return navigate(`/book/${scheduleId}/first`);
      }
      return navigate(`/book/${scheduleId}/economy`);
    }

    if (seatClass === 'economy' && schedule?.economySeatAvailable === 'None') {
      if (schedule?.firstSeatAvailable !== 'None') {
        return navigate(`/book/${scheduleId}/first`);
      }
      return navigate(`/book/${scheduleId}/business`);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, seatClass]);

  return (
    <>
      <header>
        <BackBtn
          handleClickBack={() =>
            navigate(
              schedule
                ? `/schedule/${schedule.departureStation.id}/${schedule.arrivalStation.id}/${formatDate(
                    new Date(schedule.departureTime)
                  )}`
                : '/'
            )
          }
        />
        <h1>
          <FormattedMessage id="app_book" />
        </h1>
      </header>
      <section>
        <div className={classes.header}>
          <FormattedMessage id="app_train_information" />
        </div>
        <hr />
        <div className={classes.sectionDesc}>
          <div className={classes.row}>
            <div className={classes.dateTime}>{formatDateWithDay(schedule?.departureTime, locale)}</div>
          </div>
          <div className={classes.row}>
            <div className={classes.timeAndPlace}>
              <div className={classes.time}>
                {formatHour(schedule?.departureTime)}
                <sup> WIB</sup>
              </div>
              <div className={classes.place}>{schedule?.departureStation.name}</div>
            </div>
            <div className={classes.train}>
              <div className={classes.name}>{schedule?.Train.name}</div>
              <div className={classes.arrowImage}>
                <img src={arrowImage} alt="" />
              </div>
            </div>
            <div className={classes.timeAndPlace}>
              <div className={classes.time}>
                {formatHour(schedule?.arrivalTime)}
                <sup> WIB</sup>
              </div>
              <div className={classes.place}>{schedule?.arrivalStation.name}</div>
            </div>
          </div>
          <div className={classes.options}>
            {options.map((option) => (
              <OptionCard
                key={option.seatClass}
                seatClass={option.seatClass}
                price={option.price}
                available={option.available}
                isSelected={option.seatClass === seatClass}
                onClick={() => {
                  if (option.available === 'None') return;
                  handleClickOption(option.seatClass);
                }}
              />
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className={classes.header}>
          <FormattedMessage id="app_passenger" />
        </div>
        <hr />
        <div className={classes.sectionDesc}>
          <div className={classes.checkboxes}>
            {myPassengers.map((passenger) => (
              <div className={classes.checkbox} key={passenger.id}>
                <input
                  type="checkbox"
                  id={passenger.id}
                  name={passenger.id}
                  checked={passengerIds.includes(passenger.id)}
                  onChange={() => handleClickCheckbox(passenger.id)}
                />
                <label htmlFor={passenger.id}>{passenger.name}</label>
              </div>
            ))}
          </div>
          <hr />
          <div className={classes.selectedPassengers}>
            {passengerIds.map((passengerId) => (
              <PassengerCard
                key={passengerId}
                passenger={myPassengers.find((passenger) => passenger.id === passengerId)}
                onClick={() => handleClickDelete(passengerId)}
              />
            ))}
          </div>
        </div>
      </section>
      <div className={classes.footer}>
        <Button variant="contained" className={classes.btn} onClick={handleClickChooseSeat}>
          <FormattedMessage id="app_choose_seat" />
        </Button>
      </div>
    </>
  );
};

ClassAndPassenger.propTypes = {
  schedule: PropTypes.object,
  myPassengers: PropTypes.array,
  passengerIds: PropTypes.array,
  locale: PropTypes.string.isRequired,
  intl: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  schedule: selectSchedule,
  myPassengers: selectMyPassengers,
  passengerIds: selectPassengerIds,
  locale: selectLocale,
});

export default injectIntl(connect(mapStateToProps)(ClassAndPassenger));
