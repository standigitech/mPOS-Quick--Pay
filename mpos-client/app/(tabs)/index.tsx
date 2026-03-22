import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

export default function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Here is the handlePayment function!
  const handlePayment = async () => {
    if (!phoneNumber || !amount) {
      Alert.alert('Error', 'Please enter both phone number and amount.');
      return;
    }

    let formattedPhone = phoneNumber;
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.substring(1);
    }

    setIsLoading(true);

    try {
      // ---> CHANGE THE IP ADDRESS ON THE LINE BELOW <---
      const response = await fetch('http://10.8.203.152:5000/pay', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formattedPhone,
          amount: amount,
        }),
      });

      // We wait for the backend to reply
      await response.json();
      setIsLoading(false);

      // If the backend says OK, we show success!
      if (response.ok) {
        Alert.alert('Prompt Sent!', `Check the phone (${formattedPhone}) to enter M-Pesa PIN.`);
      } else {
        Alert.alert('Error', 'Failed to send prompt to phone.');
      }

    } catch {
      setIsLoading(false);
      Alert.alert('Network Error', 'Could not connect to the backend server. Is the IP correct and the server running?');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Merchant POS</Text>
      <Text style={styles.subtitle}>Enter customer details to request payment</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Customer Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 0712345678"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          maxLength={10}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Amount (Ksh)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 500"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handlePayment}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Request M-Pesa Payment</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4', padding: 20, justifyContent: 'center' },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30, textAlign: 'center' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, color: '#333', marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 15, fontSize: 18 },
  button: { backgroundColor: '#00A859', padding: 18, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});