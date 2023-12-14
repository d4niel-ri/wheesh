const Joi = require("joi");
const { Op } = require("sequelize");
const crypto = require('crypto');

const { Schedule, SchedulePrice, Train, Carriage, Seat, Station,
        OrderedSeat, Order, Passenger, Payment, sequelize } = require("../models");
const { handleServerError, handleClientError } = require("../utils/handleError");

exports.getUnpaidOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      where: { 
        userId: req.user.id 
      },
      attributes: { exclude: ['updatedAt'] },
      include: [
        {
          model: Payment,
          attributes: { exclude: ['isNotified', 'createdAt', 'updatedAt'] }
        },
        {
          model: Schedule,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: Station,
              as: 'departureStation',
              attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
            },
            {
              model: Station,
              as: 'arrivalStation',
              attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
            },
            {
              model: Train,
              attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
            },
          ]
        },
        {
          model: OrderedSeat,
          attributes: ['name']
        }
      ],
      order: [
        ['id', 'DESC']
      ]
    });

    const filteredOrders = orders.filter((order) => 
      !order.Payment.isPaid && order.Payment.duePayment > new Date()
    );

    return res.status(200).json({ data: filteredOrders, status: 'Success' });

  } catch (error) {
    console.error(error);
    handleServerError(res);
  }
}

exports.getPaidOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({ 
      where: { 
        userId: req.user.id 
      },
      attributes: { exclude: ['updatedAt'] },
      include: [
        {
          model: Payment,
          attributes: { exclude: ['isNotified', 'createdAt', 'updatedAt'] }
        },
        {
          model: Schedule,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: Station,
              as: 'departureStation',
              attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
            },
            {
              model: Station,
              as: 'arrivalStation',
              attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
            },
            {
              model: Train,
              attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
            },
          ]
        },
        {
          model: OrderedSeat,
          attributes: ['name']
        }
      ],
      order: [
        ['id', 'DESC']
      ]
    });

    const filteredOrders = orders.filter((order) =>
      order.Payment.isPaid && 
      order.Schedule.arrivalTime >= new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
    );
    return res.status(200).json({ data: filteredOrders, status: 'Success' });

  } catch (error) {
    console.error(error);
    handleServerError(res);
  }
}

exports.getHistoryOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { 
        userId: req.user.id 
      },
      attributes: { exclude: ['updatedAt'] },
      include: [
        {
          model: Payment,
          attributes: { exclude: ['isNotified', 'createdAt', 'updatedAt'] }
        },
        {
          model: Schedule,
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: Station,
              as: 'departureStation',
              attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
            },
            {
              model: Station,
              as: 'arrivalStation',
              attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
            },
            {
              model: Train,
              attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
            },
          ]
        },
        {
          model: OrderedSeat,
          attributes: ['name']
        }
      ],
      order: [
        ['id', 'DESC']
      ]
    });

    const filteredOrders = orders.filter((order) =>
      order.Payment.isPaid && 
      order.Schedule.arrivalTime < new Date(new Date().getTime() - 6 * 60 * 60 * 1000)
    );
    return res.status(200).json({ data: filteredOrders, status: 'Success' });
  
  } catch (error) {
    console.error(error);
    handleServerError(res);
  }
}

exports.getOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const foundOrder = await Order.findByPk(
      orderId,
      {
        attributes: { exclude: ['updatedAt'] },
        include: [
          {
            model: Payment,
            attributes: { exclude: ['isNotified', 'createdAt', 'updatedAt'] }
          },
          {
            model: Schedule,
            attributes: { exclude: ['createdAt', 'updatedAt'] },
            include: [
              {
                model: Station,
                as: 'departureStation',
                attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
              },
              {
                model: Station,
                as: 'arrivalStation',
                attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
              },
              {
                model: Train,
                attributes: { exclude: [ 'createdAt', 'updatedAt' ] }
              },
            ]
          },
          {
            model: OrderedSeat,
            attributes: { exclude: [ 'createdAt', 'updatedAt'] },
            include: [
              {
                model: Seat,
                attributes: { exclude: [ 'createdAt', 'updatedAt' ] },
                include: [
                  {
                    model: Carriage,
                    attributes: { exclude: [ 'createdAt', 'updatedAt' ] },
                  }
                ]
              }
            ]
          }
        ],
        order: [
          ['id', 'DESC']
        ]
      }
    );

    if (!foundOrder)
      return handleClientError(res, 404, 'Order Not Found');

    if (foundOrder.userId !== req.user.id)
      return handleClientError(res, 400, 'Not Authorized');

    if (!foundOrder.Payment.isPaid || 
        foundOrder.Schedule.arrivalTime < new Date(new Date().getTime() - 6 * 60 * 60 * 1000)) {
      console.log('Cannot get secret');
      const formattedOrder = foundOrder.toJSON();
      formattedOrder.OrderedSeats = formattedOrder.OrderedSeats.map((orderedSeat) => {
        const {secret, ...rest} = orderedSeat;
        return rest;
      })
      return res.status(200).json({ data: formattedOrder, status: 'Success' });

    } else {
      console.log('Can get secret');
      return res.status(200).json({ data: foundOrder, status: 'Success' });
    }

  } catch (error) {
    console.error(error);
    handleServerError(res);
  }
}

exports.createOrder = async (req, res) => {
  try {
    const { scheduleId, orderedSeats } = req.body;
    const scheme = Joi.object({
      scheduleId: Joi.number().integer().required(),
      orderedSeats: Joi.array().items(
        Joi.object(
          {
            seatId: Joi.number().integer().required(),
            passengerId: Joi.number().integer().required(),
          }
        )
      ).unique((a, b) => a.seatId === b.seatId).required(),
    });
    const { error } = scheme.validate(req.body);
    if (error) 
      return res.status(400).json({ status: 'Validation Failed', message: error.details[0].message })

    await sequelize.transaction(async (t) => {
      const foundSchedule = await Schedule.findByPk(
        scheduleId,
        {
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          include: [
            {
              model: Train,
              attributes: { exclude: [ 'createdAt', 'updatedAt' ] },
              include: [
                {
                  model: Carriage,
                  attributes: { exclude: [ 'createdAt', 'updatedAt' ] },
                  include: [
                    {
                      model: Seat,
                      attributes: { exclude: [ 'createdAt', 'updatedAt' ] },
                      include: [
                        {
                          model: OrderedSeat,
                          attributes: { exclude: [ 'createdAt', 'updatedAt' ] },
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              model: Order,
            },
            {
              model: SchedulePrice,
              as: 'prices'
            },
          ],
          transaction: t
        }
      );
      if (!foundSchedule)
        return handleClientError(res, 404, 'Schedule Not Found');

      if (new Date(foundSchedule.departureTime) < new Date(new Date() + 30 * 60 * 1000))
        return handleClientError(res, 403, 'The train will depart soon');

      const passengerIds = orderedSeats.map((orderedSeat) => orderedSeat.passengerId);
      const foundPassengers = await Passenger.findAll({
        where: {id: passengerIds, userId: req.user.id},
        transaction: t
      });

      if (foundPassengers.length !== passengerIds.length)
        return handleClientError(res, 400, 'You cannot not include other user\'s passengers');

      const seatIds = orderedSeats.map((orderedSeats) => orderedSeats.seatId);

      const foundScheduleJSON = foundSchedule.toJSON();
      const orderIds = foundScheduleJSON.Orders.map((order) => order.id);
      for (const carriage of foundScheduleJSON.Train.Carriages) {
        for (const seat of carriage.Seats) {
          if (seatIds.includes(seat.id)) {
            const isBooked = seat.OrderedSeats.some((orderedSeat) => orderIds.includes(orderedSeat.orderId));
            if (isBooked)
              return handleClientError(
                res, 
                409, 
                `You cannot book booked seat ${String(carriage.carriageNumber).padStart(2, '0')}-${seat.seatNumber}`
              )
          }
        }
      }

      const orderedPrices = [];
      for (const seatId of seatIds) {
        const seat = await Seat.findByPk(seatId, {transaction: t});
        const price = foundSchedule.prices.find(
          (schedulePrice) => schedulePrice.seatClass === seat.seatClass
        ).price;
        orderedPrices.push(price);
      }
      
      const newOrder = await Order.create(
        {
          userId: req.user.id,
          scheduleId
        },
        { transaction: t }
      );

      for (let i = 0; i < orderedSeats.length; i++) {
        await OrderedSeat.create(
          {
            orderId: newOrder.id,
            seatId: seatIds[i],
            price: orderedPrices[i],
            gender: foundPassengers[i].gender,
            dateOfBirth: foundPassengers[i].dateOfBirth,
            idCard: foundPassengers[i].idCard,
            name: foundPassengers[i].name,
            email: foundPassengers[i].email,
            secret: crypto.randomBytes(32).toString('hex'),
          },  
          { transaction: t }
        )
      }

      await Payment.create(
        {
          orderId: newOrder.id,
          amount: orderedPrices.reduce((accumulator, value) => accumulator + value, 0),
          isPaid: false,
          duePayment: new Date(new Date().getTime() + 60 * 60 * 1000),
        },
        { transaction: t }
      )

      return res.status(201).json({ data: newOrder.id, message: 'Successfully booked seats', status: 'success' });
    })

  } catch (error) {
    console.error(error);
    handleServerError(res);
  }
}

exports.payOrder = async (req, res) => {
  try { 
    const { orderId } = req.params;
    const foundOrder = await Order.findByPk(orderId);
    if (!foundOrder)
      return handleClientError(res, 404, 'Order Not Found');

    if (foundOrder.userId !== req.user.id)
      return handleClientError(res, 400, 'Not Authorized');

    const payment = await Payment.findOne({ where: {orderId} });
    if (payment.isPaid)
      return handleClientError(res, 400, 'The order was paid');

    if (payment.duePayment < new Date())
      return handleClientError(res, 400, 'The order has passed payment due time');

    payment.isPaid = true;
    await payment.save();

    return res.status(200).json({ message: 'Successfully paid the order', status: 'Success' });

  } catch (error) {
    console.error(error);
    handleServerError(res);
  }
}

exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const foundOrder = await Order.findByPk(orderId, {
      include: [
        { model: Payment }
      ]
    });
    if (!foundOrder)
      return handleClientError(res, 404, 'Order Not Found');

    if (foundOrder.userId !== req.user.id)
      return handleClientError(res, 400, 'Not Authorized');

    if (foundOrder.Payment.isPaid)
      return handleClientError(res, 400, 'Cannot cancel paid order');

    await Order.destroy({ where: {id: orderId} });
    return res.status(200).json({ message: 'Successfully cancel the order', status: 'Success' });

  } catch (error) {
    console.error(error);
    handleServerError(res);
  }
}