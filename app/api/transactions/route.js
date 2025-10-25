import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';


async function convertCurrency(from, to, amount) {
  try {
    // If same currency, no conversion needed
    if (from === to) {
      return {
        convertedAmount: amount,
        rate: 1,
        fromCurrency: from,
        toCurrency: to,
      };
    }

    // Fetch Bit.com and ExchangeRate.host data
    let bitData = {};
    let exchangeData = {};

    try {
      // Try Bit.com spot tickers (primary endpoint)
      const bitResponse = await fetch('https://api.bit.com/spot/v1/market/tickers');
      const bitText = await bitResponse.text();

      if (bitText.startsWith('{')) {
        bitData = JSON.parse(bitText);
      } else {
        console.warn('⚠️ Bit.com API returned non-JSON:', bitText);
      }
    } catch (err) {
      console.error('⚠️ Failed to fetch Bit.com data:', err.message);
    }

    try {
      // ExchangeRate.host for DZD <-> USD
      const exchangeResponse = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=DZD');
      const exchangeText = await exchangeResponse.text();

      if (exchangeText.startsWith('{')) {
        exchangeData = JSON.parse(exchangeText);
      } else {
        console.warn('⚠️ ExchangeRate.host returned non-JSON:', exchangeText);
      }
    } catch (err) {
      console.error('⚠️ Failed to fetch ExchangeRate.host data:', err.message);
    }

    // Define base fallback rates
    const rates = {
      USDT_USD: 1, // USDT pegged to USD
      USD_DZD: exchangeData?.rates?.DZD || 135, // fallback DZD rate
    };

    // Find USDT/KRW in Bit.com data (spot)
    const usdtKrwPair =
      bitData?.data?.find(
        (ticker) => ticker.symbol === 'USDT-KRW' || ticker.symbol === 'USDTKRW'
      ) || {};

    const usdtKrwRate = parseFloat(usdtKrwPair.last || usdtKrwPair.lastPrice || 1350);
    rates.USDT_KRW = isNaN(usdtKrwRate) ? 1350 : usdtKrwRate;

    // Derive other rates
    rates.DZD_USD = 1 / rates.USD_DZD;
    rates.USD_USDT = 1 / rates.USDT_USD;
    rates.DZD_USDT = rates.DZD_USD / rates.USDT_USD;
    rates.USDT_DZD = 1 / rates.DZD_USDT;
    rates.KRW_USDT = 1 / rates.USDT_KRW;
    rates.DZD_KRW = rates.DZD_USDT * rates.USDT_KRW;
    rates.KRW_DZD = 1 / rates.DZD_KRW;

    const rateKey = `${from}_${to}`;
    const rate = rates[rateKey];

    if (!rate) {
      throw new Error(`No conversion rate found for ${from} → ${to}`);
    }

    const convertedAmount = amount * rate;

    return {
      convertedAmount: Math.round(convertedAmount * 100) / 100,
      rate: Math.round(rate * 100000) / 100000,
      fromCurrency: from,
      toCurrency: to,
    };
  } catch (error) {
    console.error('Currency conversion error:', error);

    // Return fallback
    return {
      convertedAmount: amount,
      rate: 1,
      fromCurrency: from,
      toCurrency: to,
      error: 'Fallback used - conversion failed',
    };
  }
}



// GET - Fetch all transactions
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db('dreamcars');

    const transactions = await db
      .collection('transactions')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// POST - Create new transaction with currency conversion
export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db('dreamcars');
    const body = await request.json();

    const { senderFullName, receiverFullName, currencyFrom, currencyTo, amountSent } = body;

    // Validation
    if (!senderFullName || !receiverFullName || !currencyFrom || !currencyTo || !amountSent) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amountSent <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // Perform currency conversion
    const conversion = await convertCurrency(currencyFrom, currencyTo, parseFloat(amountSent));

    // Create transaction record
    const transaction = {
      senderFullName,
      receiverFullName,
      currencyFrom,
      currencyTo,
      amountSent: parseFloat(amountSent),
      amountReceived: conversion.convertedAmount,
      conversionRate: conversion.rate,
      createdAt: new Date(),
    };

    const result = await db.collection('transactions').insertOne(transaction);

    return NextResponse.json({
      message: 'Transaction created successfully',
      id: result.insertedId,
      transaction: {
        ...transaction,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}

// DELETE - Delete a transaction (optional, for admin cleanup)
export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db('dreamcars');
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID parameter is required' }, { status: 400 });
    }

    const result = await db.collection('transactions').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
