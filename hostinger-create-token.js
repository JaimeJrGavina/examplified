#!/usr/bin/env node
/**
 * Hostinger Token Generator
 * 
 * This script creates customer tokens directly and stores them in a JSON file.
 * Upload this to your Hostinger hosting and run via SSH or cPanel Terminal.
 * 
 * Usage:
 *   node hostinger-create-token.js <email>
 *   node hostinger-create-token.js john@example.com
 * 
 * This generates a token and saves it to customers.json
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration
const DATA_DIR = path.join(__dirname, 'data');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Load existing customers from file
 */
function loadCustomers() {
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const raw = fs.readFileSync(CUSTOMERS_FILE, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading customers:', err.message);
  }
  return { customers: [], recoveryTokens: [] };
}

/**
 * Save customers to file
 */
function saveCustomers(data) {
  try {
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving customers:', err.message);
    return false;
  }
}

/**
 * Generate a unique token
 */
function generateToken() {
  return 'cust_' + crypto.randomBytes(12).toString('hex');
}

/**
 * Create a new customer token
 */
function createCustomer(email) {
  if (!email || typeof email !== 'string') {
    throw new Error('Invalid email address');
  }

  const trimmedEmail = email.trim().toLowerCase();
  
  // Validate email format (basic)
  if (!trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    throw new Error('Invalid email format');
  }

  const data = loadCustomers();

  // Check if customer already exists
  if ((data.customers || []).find(c => c.email === trimmedEmail)) {
    throw new Error(`Email already exists: ${trimmedEmail}`);
  }

  // Create new customer
  const customer = {
    id: `cust-${Date.now()}`,
    email: trimmedEmail,
    token: generateToken(),
    status: 'active',
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };

  // Add to data
  data.customers = data.customers || [];
  data.customers.push(customer);

  // Save to file
  const saved = saveCustomers(data);
  if (!saved) {
    throw new Error('Failed to save customer to file');
  }

  return customer;
}

/**
 * List all customers
 */
function listCustomers() {
  const data = loadCustomers();
  return data.customers || [];
}

/**
 * Delete a customer by ID or email
 */
function deleteCustomer(identifier) {
  const data = loadCustomers();
  const isEmail = identifier.includes('@');
  
  const filtered = (data.customers || []).filter(c => 
    isEmail ? c.email !== identifier : c.id !== identifier
  );

  if (filtered.length === (data.customers || []).length) {
    throw new Error('Customer not found');
  }

  data.customers = filtered;
  saveCustomers(data);
  return true;
}

/**
 * Main CLI logic
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    if (!command || command === '--help' || command === '-h') {
      printHelp();
      return;
    }

    if (command === 'create') {
      const email = args[1];
      if (!email) {
        console.error('❌ Error: Email is required');
        console.log('Usage: node hostinger-create-token.js create <email>');
        process.exit(1);
      }
      const customer = createCustomer(email);
      printCustomerCreated(customer);
      process.exit(0);
    }

    if (command === 'list') {
      const customers = listCustomers();
      printCustomersList(customers);
      process.exit(0);
    }

    if (command === 'delete') {
      const identifier = args[1];
      if (!identifier) {
        console.error('❌ Error: Email or ID is required');
        console.log('Usage: node hostinger-create-token.js delete <email-or-id>');
        process.exit(1);
      }
      deleteCustomer(identifier);
      console.log(`✅ Customer deleted: ${identifier}`);
      process.exit(0);
    }

    // Default: treat first arg as email (backward compatibility)
    const email = command;
    const customer = createCustomer(email);
    printCustomerCreated(customer);
    process.exit(0);

  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Print help message
 */
function printHelp() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Hostinger Token Generator for Examplified          ║
╚══════════════════════════════════════════════════════════════╝

📝 Usage:
  node hostinger-create-token.js create <email>
  node hostinger-create-token.js list
  node hostinger-create-token.js delete <email-or-id>

📋 Examples:
  # Create a new customer token
  node hostinger-create-token.js create john@example.com
  
  # List all customers and their tokens
  node hostinger-create-token.js list
  
  # Delete a customer
  node hostinger-create-token.js delete john@example.com

💾 Data Storage:
  - Tokens are stored in: ./data/customers.json
  - Automatically creates the data directory if it doesn't exist
  - Each customer gets a unique token in format: cust_[12-byte-hex]

🔐 Security Notes:
  - Keep customers.json secure and backed up
  - Tokens are unique and cannot be guessed
  - Never share customers.json publicly

`);
}

/**
 * Print created customer info
 */
function printCustomerCreated(customer) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║              ✅ CUSTOMER TOKEN CREATED SUCCESSFULLY          ║
╚══════════════════════════════════════════════════════════════╝

📧 Email:        ${customer.email}
🆔 Customer ID:  ${customer.id}
⏰ Created:      ${customer.createdAt}

┌──────────────────────────────────────────────────────────────┐
│ 🔑 STUDENT LOGIN TOKEN (Share this with student)            │
├──────────────────────────────────────────────────────────────┤
│ ${customer.token}
└──────────────────────────────────────────────────────────────┘

📱 How to use:
  1. Send this token to the student
  2. Student goes to: https://smartbarexam.com/
  3. Click "Student Login"
  4. Paste the token above
  5. Student can now access all exams

💾 Token saved to: ./data/customers.json

`);
}

/**
 * Print customers list
 */
function printCustomersList(customers) {
  if (customers.length === 0) {
    console.log('📭 No customers found');
    return;
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    📋 ALL CUSTOMERS (${customers.length})                      ║
╚══════════════════════════════════════════════════════════════╝
`);

  customers.forEach((c, i) => {
    console.log(`${i + 1}. ${c.email}`);
    console.log(`   ID:    ${c.id}`);
    console.log(`   Token: ${c.token}`);
    console.log(`   Created: ${c.createdAt}`);
    console.log(`   Status: ${c.status}`);
    console.log('');
  });

  console.log(`Total: ${customers.length} customer(s)\n`);
}

// Run main function
main();
