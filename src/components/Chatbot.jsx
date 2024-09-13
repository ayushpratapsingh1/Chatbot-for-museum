import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [step, setStep] = useState(0);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMuseum, setSelectedMuseum] = useState('');
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [isNRI, setIsNRI] = useState(false);
  const [numTickets, setNumTickets] = useState(1);
  const [numAdults, setNumAdults] = useState(1);
  const [numChildren, setNumChildren] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [qrCode, setQrCode] = useState('');

  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [museums, setMuseums] = useState([]);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    fetchStates();
    window.addEventListener('message', handlePaymentComplete);
    return () => {
      window.removeEventListener('message', handlePaymentComplete);
    };
  }, []);

  useEffect(() => {
    if (selectedState) {
      fetchDistricts();
    }
  }, [selectedState]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchMuseums();
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchStates = async () => {
    const statesRef = collection(db, 'states');
    const snapshot = await getDocs(statesRef);
    const statesData = snapshot.docs.map(doc => doc.id);
    setStates(statesData);
    addMessage('bot', 'Welcome to the Museum Ticketing System! Which state are you interested in visiting?', statesData);
  };

  const fetchDistricts = async () => {
    const districtsRef = collection(db, 'states', selectedState, 'districts');
    const snapshot = await getDocs(districtsRef);
    const districtsData = snapshot.docs.map(doc => doc.data().name);
    setDistricts(districtsData);
    addMessage('bot', `Great! Which district in ${selectedState} would you like to visit?`, districtsData);
  };

  const fetchMuseums = async () => {
    const museumsRef = collection(db, 'states', selectedState, 'districts', selectedDistrict, 'museums');
    const snapshot = await getDocs(museumsRef);
    const museumsData = snapshot.docs.map(doc => doc.data().name);
    setMuseums(museumsData);
    addMessage('bot', `Excellent choice! Here are the museums available in ${selectedDistrict}:`, museumsData);
  };

  const addMessage = (sender, text, options = null) => {
    setMessages(prevMessages => [...prevMessages, { sender, text, options }]);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() === '') return;

    addMessage('user', inputValue);
    processUserInput(inputValue);
    setInputValue('');
  };

  const processUserInput = (input) => {
    switch (step) {
      case 0:
        if (states.includes(input)) {
          setSelectedState(input);
          setStep(1);
        } else {
          addMessage('bot', "I'm sorry, I didn't recognize that state. Please try again.");
        }
        break;
      case 1:
        if (districts.includes(input)) {
          setSelectedDistrict(input);
          setStep(2);
        } else {
          addMessage('bot', "I'm sorry, I didn't recognize that district. Please try again.");
        }
        break;
      case 2:
        if (museums.includes(input)) {
          setSelectedMuseum(input);
          setStep(3);
          addMessage('bot', 'Great choice! Now, please enter your full name.');
        } else {
          addMessage('bot', "I'm sorry, I didn't recognize that museum. Please try again.");
        }
        break;
      case 3:
        setFullName(input);
        setStep(4);
        addMessage('bot', 'Thank you. Now, please enter your age.');
        break;
      case 4:
        setAge(input);
        setStep(5);
        addMessage('bot', 'Got it. What is your sex? (Male/Female/Other)');
        break;
      case 5:
        setSex(input);
        setStep(6);
        addMessage('bot', 'Are you an NRI? (Yes/No)');
        break;
      case 6:
        setIsNRI(input.toLowerCase() === 'yes');
        setStep(7);
        addMessage('bot', 'How many tickets would you like to book?');
        break;
      case 7:
        setNumTickets(parseInt(input));
        if (isNRI) {
          calculateTotalAmount(parseInt(input), 0);
          setStep(9);
          addMessage('bot', `Great! Your total amount is ₹${totalAmount}. Would you like to proceed to payment? (Yes/No)`);
        } else {
          setStep(8);
          addMessage('bot', `How many of these ${input} tickets are for adults?`);
        }
        break;
      case 8:
        setNumAdults(parseInt(input));
        const remainingTickets = numTickets - parseInt(input);
        setNumChildren(remainingTickets);
        calculateTotalAmount(parseInt(input), remainingTickets);
        setStep(9);
        addMessage('bot', `Great! Your total amount is ₹${totalAmount}. Would you like to proceed to payment? (Yes/No)`);
        break;
      case 9:
        if (input.toLowerCase() === 'yes') {
          handlePayment();
        } else {
          addMessage('bot', 'No problem. Is there anything else I can help you with?');
          setStep(0);
        }
        break;
      default:
        addMessage('bot', "I'm sorry, I didn't understand that. Can you please try again?");
    }
  };

  const calculateTotalAmount = (adults, children) => {
    const adultPrice = sex === 'Female' ? 80 : 100;
    const childPrice = 40;
    const nriPrice = 200;

    let total = 0;
    if (isNRI) {
      total = nriPrice * numTickets;
    } else {
      total = (adultPrice * adults) + (childPrice * children);
    }
    setTotalAmount(total);
  };

  const handlePayment = () => {
    window.open('payment.html', 'paymentWindow', 'width=600,height=400');
  };

  const handlePaymentComplete = (event) => {
    if (event.data === 'paymentComplete') {
      setPaymentComplete(true);
      generateQRCode();
      addMessage('bot', 'Payment completed successfully! Here\'s your QR code ticket:');
      setStep(10);
    }
  };

  const generateQRCode = () => {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MuseumTicket_${selectedMuseum}_${fullName}`;
    setQrCode(qrCodeUrl);
    addMessage('bot', '', null, qrCodeUrl);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <motion.div
            key={index}
            className={`message ${message.sender}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p>{message.text}</p>
            {message.options && (
              <div className="options">
                {message.options.map((option, optionIndex) => (
                  <button key={optionIndex} onClick={() => processUserInput(option)}>
                    {option}
                  </button>
                ))}
              </div>
            )}
            {message.qrCode && <img src={message.qrCode} alt="QR Code Ticket" />}
          </motion.div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type your message here..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;