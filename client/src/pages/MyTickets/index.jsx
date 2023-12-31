import { connect, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { createStructuredSelector } from 'reselect';
import { useEffect } from 'react';
import thinkingImage from '@static/images/thinking.svg';
import pleaseImage from '@static/images/please.png';
import { selectUser } from '@containers/Client/selectors';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { selectNavChosen, selectOrders } from './selectors';

import { getOrders, setNavChosen } from './actions';
import OrderCard from './components/OrderCard';

import classes from './style.module.scss';

const MyTickets = ({ navChosen, orders, user }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) dispatch(getOrders(navChosen));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navChosen]);

  return (
    <main className={classes.main}>
      <div className={classes.container}>
        <header>
          <h1>
            <FormattedMessage id="app_my_tickets" />
          </h1>
        </header>

        {!user ? (
          <div className={classes.sectionImage}>
            <div className={classes.image}>
              <img src={pleaseImage} alt="Please" />
            </div>
            <div className={classes.message}>
              <FormattedMessage id="app_please_login_check_order" />
            </div>
            <Button variant="contained" className={classes.btn} onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        ) : (
          <>
            <nav>
              <div
                className={`${classes.itemNav} ${navChosen === 'unpaid' ? classes.chosen : ''}`}
                onClick={() => dispatch(setNavChosen('unpaid'))}
              >
                <div className={classes.name}>
                  <FormattedMessage id="app_unpaid" />
                </div>
                <hr />
              </div>
              <div
                className={`${classes.itemNav} ${navChosen === 'paid' ? classes.chosen : ''}`}
                onClick={() => dispatch(setNavChosen('paid'))}
              >
                <div className={classes.name}>
                  <FormattedMessage id="app_paid" />
                </div>
                <hr />
              </div>
              <div
                className={`${classes.itemNav} ${navChosen === 'history' ? classes.chosen : ''}`}
                onClick={() => dispatch(setNavChosen('history'))}
              >
                <div className={classes.name}>
                  <FormattedMessage id="app_history" />
                </div>
                <hr />
              </div>
            </nav>
            <div className={classes.orders}>
              {orders.length === 0 ? (
                <div className={classes.sectionImage}>
                  <div className={classes.image}>
                    <img src={thinkingImage} alt="Thinking" />
                  </div>
                  <div className={classes.message}>
                    <FormattedMessage id="app_no_data" />
                  </div>
                </div>
              ) : (
                orders.map((order) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

MyTickets.propTypes = {
  navChosen: PropTypes.string.isRequired,
  orders: PropTypes.array.isRequired,
  user: PropTypes.object,
};

const mapStateToProps = createStructuredSelector({
  navChosen: selectNavChosen,
  orders: selectOrders,
  user: selectUser,
});

export default connect(mapStateToProps)(MyTickets);
