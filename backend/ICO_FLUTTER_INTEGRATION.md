# ICO Coin Integration for Flutter App

## 🪙 ICO Token Information

**Token Symbol:** ICOX  
**Current Price:** ₹10 per token  
**API Base URL:** `https://nirv-ico.onrender.com/api`

---

## 📊 Complete ICO Features Flow

### **Feature 1: Display ICO Token Price (Public)**

### **Feature 2: Show User Holdings & Portfolio**

### **Feature 3: Buy ICO Tokens with PhonePe**

### **Feature 4: Sell ICO Tokens**

### **Feature 5: Transaction History**

---

## 🔑 API Credentials & Configuration

### **Backend Environment Variables**

```env
# ICO Token Settings
ICO_TOKEN_SYMBOL=ICOX
ICO_PRICE_INR=10

# PhonePe Payment Gateway (For Buy/Sell)
PHONEPE_MERCHANT_ID=your_phonepe_merchant_id
PHONEPE_SALT_KEY=your_phonepe_salt_key
PHONEPE_SALT_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
PHONEPE_CALLBACK_URL=https://nirv-ico.onrender.com/api/payments/phonepe/callback
```

**Note:** All credentials are configured on the backend. Flutter app only needs to call the APIs with proper authentication.

---

## 📱 API 1: Get ICO Token Price (Public - No Auth)

### **Endpoint**

```
GET /ico/price
```

### **Request**

```http
GET https://nirv-ico.onrender.com/api/ico/price
Content-Type: application/json
```

**No Authentication Required** - This is a public endpoint

### **Response**

```json
{
  "symbol": "ICOX",
  "priceINR": 10
}
```

### **Flutter Implementation**

```dart
// Service Method
class IcoService {
  final ApiService _api = ApiService();

  Future<Map<String, dynamic>> getTokenPrice() async {
    final response = await _api.get('/ico/price');
    return response;
  }
}

// Usage in Screen
class IcoDashboardScreen extends StatefulWidget {
  @override
  _IcoDashboardScreenState createState() => _IcoDashboardScreenState();
}

class _IcoDashboardScreenState extends State<IcoDashboardScreen> {
  final IcoService _icoService = IcoService();
  String tokenSymbol = '';
  double tokenPrice = 0.0;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTokenPrice();
  }

  Future<void> _loadTokenPrice() async {
    setState(() => isLoading = true);
    try {
      final data = await _icoService.getTokenPrice();
      setState(() {
        tokenSymbol = data['symbol'];
        tokenPrice = data['priceINR'].toDouble();
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('ICO Dashboard')),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                children: [
                  Card(
                    child: Padding(
                      padding: EdgeInsets.all(16),
                      child: Column(
                        children: [
                          Text('Current Token Price',
                              style: TextStyle(fontSize: 16)),
                          SizedBox(height: 8),
                          Text('$tokenSymbol',
                              style: TextStyle(
                                  fontSize: 24, fontWeight: FontWeight.bold)),
                          Text('₹${tokenPrice.toStringAsFixed(2)} per token',
                              style: TextStyle(
                                  fontSize: 20, color: Colors.green)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
```

---

## 📊 API 2: Get User ICO Holdings & Portfolio Summary

### **Endpoint**

```
GET /ico/summary
```

### **Request**

```http
GET https://nirv-ico.onrender.com/api/ico/summary
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**Authentication Required:** Yes (JWT Token)

### **Response**

```json
{
  "tokenSymbol": "ICOX",
  "pricePerToken": 10,
  "totalTokens": 100,
  "totalInvestedINR": 1000,
  "currentValueINR": 1000,
  "profitLoss": 0,
  "profitLossPercent": 0
}
```

### **Response Fields Explained**

- `tokenSymbol`: Token name (ICOX)
- `pricePerToken`: Current price per token (₹10)
- `totalTokens`: Total tokens owned by user (100)
- `totalInvestedINR`: Total amount invested (₹1000)
- `currentValueINR`: Current portfolio value (₹1000)
- `profitLoss`: Profit or loss amount (₹0)
- `profitLossPercent`: Profit/loss percentage (0%)

### **Flutter Implementation**

```dart
// Model
class IcoSummary {
  final String tokenSymbol;
  final double pricePerToken;
  final int totalTokens;
  final double totalInvestedINR;
  final double currentValueINR;
  final double profitLoss;
  final double profitLossPercent;

  IcoSummary({
    required this.tokenSymbol,
    required this.pricePerToken,
    required this.totalTokens,
    required this.totalInvestedINR,
    required this.currentValueINR,
    required this.profitLoss,
    required this.profitLossPercent,
  });

  factory IcoSummary.fromJson(Map<String, dynamic> json) {
    return IcoSummary(
      tokenSymbol: json['tokenSymbol'],
      pricePerToken: (json['pricePerToken'] as num).toDouble(),
      totalTokens: json['totalTokens'],
      totalInvestedINR: (json['totalInvestedINR'] as num).toDouble(),
      currentValueINR: (json['currentValueINR'] as num).toDouble(),
      profitLoss: (json['profitLoss'] as num).toDouble(),
      profitLossPercent: (json['profitLossPercent'] as num).toDouble(),
    );
  }
}

// Service Method
Future<IcoSummary> getIcoSummary() async {
  final token = await StorageService.getToken();
  final response = await _api.get('/ico/summary', token: token);
  return IcoSummary.fromJson(response);
}

// UI Widget
Widget buildPortfolioCard(IcoSummary summary) {
  return Card(
    elevation: 4,
    child: Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Your Portfolio',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          SizedBox(height: 16),

          // Total Tokens
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Tokens:', style: TextStyle(fontSize: 16)),
              Text('${summary.totalTokens} ${summary.tokenSymbol}',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          SizedBox(height: 8),

          // Current Value
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Current Value:', style: TextStyle(fontSize: 16)),
              Text('₹${summary.currentValueINR.toStringAsFixed(2)}',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ],
          ),
          SizedBox(height: 8),

          // Invested Amount
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Total Invested:', style: TextStyle(fontSize: 16)),
              Text('₹${summary.totalInvestedINR.toStringAsFixed(2)}',
                  style: TextStyle(fontSize: 16, color: Colors.grey)),
            ],
          ),
          SizedBox(height: 16),
          Divider(),
          SizedBox(height: 8),

          // Profit/Loss
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Profit/Loss:', style: TextStyle(fontSize: 16)),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '₹${summary.profitLoss.toStringAsFixed(2)}',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: summary.profitLoss >= 0 ? Colors.green : Colors.red,
                    ),
                  ),
                  Text(
                    '${summary.profitLossPercent >= 0 ? '+' : ''}${summary.profitLossPercent.toStringAsFixed(2)}%',
                    style: TextStyle(
                      fontSize: 14,
                      color: summary.profitLoss >= 0 ? Colors.green : Colors.red,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    ),
  );
}
```

---

## 💰 API 3: Buy ICO Tokens (with PhonePe Payment)

### **Endpoint**

```
POST /ico/buy
```

### **Request**

```http
POST https://nirv-ico.onrender.com/api/ico/buy
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "tokens": 100
}
```

**Authentication Required:** Yes (JWT Token)

### **Request Body**

```json
{
  "tokens": 100
}
```

**Field:** `tokens` - Number of tokens to buy (integer)

### **Response**

```json
{
  "transaction": {
    "_id": "txn_789",
    "type": "buy",
    "tokens": 100,
    "pricePerToken": 10,
    "totalAmountINR": 1000,
    "paymentStatus": "pending",
    "createdAt": "2025-11-29T14:00:00.000Z"
  },
  "paymentSession": {
    "merchantTransactionId": "ICO_BUY_1234567890",
    "base64Payload": "ewogICJtZXJjaGFudElkIjogIk1fVEVTVCIsCiAgIm1lcmNoYW50VHJhbnNhY3Rpb25JZCI6ICJJQ09fQlVZXzEyMzQ1Njc4OTAiLAogICJhbW91bnQiOiAxMDAwMDAsCiAgImNhbGxiYWNrVXJsIjogImh0dHBzOi8vbmlydi1pY28ub25yZW5kZXIuY29tL2FwaS9wYXltZW50cy9waG9uZXBlL2NhbGxiYWNrIgp9",
    "checksum": "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
    "redirectUrl": "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"
  }
}
```

### **PhonePe Payment Flow**

1. User enters number of tokens to buy
2. App calculates total amount (tokens × price)
3. Call `/ico/buy` API
4. Receive `paymentSession` data
5. Open PhonePe payment in WebView
6. User completes payment
7. PhonePe redirects back
8. Backend updates transaction status
9. App refreshes holdings

### **Flutter Implementation**

```dart
// Service Method
Future<Map<String, dynamic>> buyTokens(int tokens) async {
  final token = await StorageService.getToken();
  final response = await _api.post(
    '/ico/buy',
    {'tokens': tokens},
    token: token,
  );
  return response;
}

// Buy Tokens Screen
class BuyTokensScreen extends StatefulWidget {
  @override
  _BuyTokensScreenState createState() => _BuyTokensScreenState();
}

class _BuyTokensScreenState extends State<BuyTokensScreen> {
  final TextEditingController _tokensController = TextEditingController();
  final IcoService _icoService = IcoService();
  double tokenPrice = 10.0;
  bool isLoading = false;

  double get totalAmount {
    final tokens = int.tryParse(_tokensController.text) ?? 0;
    return tokens * tokenPrice;
  }

  Future<void> _buyTokens() async {
    final tokens = int.tryParse(_tokensController.text);
    if (tokens == null || tokens <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter valid number of tokens')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      final response = await _icoService.buyTokens(tokens);

      // Extract payment session
      final paymentSession = response['paymentSession'];
      final redirectUrl = paymentSession['redirectUrl'];
      final base64Payload = paymentSession['base64Payload'];
      final checksum = paymentSession['checksum'];

      // Open PhonePe payment
      final result = await Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PaymentWebViewScreen(
            redirectUrl: redirectUrl,
            base64Payload: base64Payload,
            checksum: checksum,
          ),
        ),
      );

      setState(() => isLoading = false);

      if (result == true) {
        // Payment successful
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text('Success'),
            content: Text('Tokens purchased successfully!'),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Go back to dashboard
                },
                child: Text('OK'),
              ),
            ],
          ),
        );
      } else if (result == false) {
        // Payment failed
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Payment failed. Please try again.')),
        );
      }
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Buy Tokens')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Token Price Display
            Card(
              color: Colors.blue[50],
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text('Current Price',
                        style: TextStyle(fontSize: 14, color: Colors.grey)),
                    SizedBox(height: 4),
                    Text('₹${tokenPrice.toStringAsFixed(2)} per ICOX',
                        style: TextStyle(
                            fontSize: 20, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24),

            // Tokens Input
            TextField(
              controller: _tokensController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Number of Tokens',
                hintText: 'Enter tokens to buy',
                border: OutlineInputBorder(),
                suffixText: 'ICOX',
              ),
              onChanged: (value) => setState(() {}),
            ),
            SizedBox(height: 16),

            // Total Amount Display
            Card(
              color: Colors.green[50],
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Total Amount:',
                        style: TextStyle(fontSize: 16)),
                    Text('₹${totalAmount.toStringAsFixed(2)}',
                        style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.green)),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24),

            // Buy Button
            ElevatedButton(
              onPressed: isLoading ? null : _buyTokens,
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.green,
              ),
              child: isLoading
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text('Buy Tokens',
                      style: TextStyle(fontSize: 18, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 💸 API 4: Sell ICO Tokens

### **Endpoint**

```
POST /ico/sell
```

### **Request**

```http
POST https://nirv-ico.onrender.com/api/ico/sell
Content-Type: application/json
Authorization: Bearer {jwt_token}

{
  "tokens": 50
}
```

**Authentication Required:** Yes (JWT Token)

### **Request Body**

```json
{
  "tokens": 50
}
```

**Field:** `tokens` - Number of tokens to sell (integer)

### **Response**

```json
{
  "message": "Sell request submitted",
  "transaction": {
    "_id": "txn_790",
    "type": "sell",
    "tokens": 50,
    "pricePerToken": 10,
    "totalAmountINR": 500,
    "paymentStatus": "pending",
    "createdAt": "2025-11-29T14:30:00.000Z"
  }
}
```

### **Sell Flow**

1. User enters number of tokens to sell
2. App validates user has enough tokens
3. Call `/ico/sell` API
4. Transaction created with "pending" status
5. Admin will process the payout
6. User receives money to their account

### **Flutter Implementation**

```dart
// Service Method
Future<Map<String, dynamic>> sellTokens(int tokens) async {
  final token = await StorageService.getToken();
  final response = await _api.post(
    '/ico/sell',
    {'tokens': tokens},
    token: token,
  );
  return response;
}

// Sell Tokens Screen
class SellTokensScreen extends StatefulWidget {
  final int availableTokens;

  SellTokensScreen({required this.availableTokens});

  @override
  _SellTokensScreenState createState() => _SellTokensScreenState();
}

class _SellTokensScreenState extends State<SellTokensScreen> {
  final TextEditingController _tokensController = TextEditingController();
  final IcoService _icoService = IcoService();
  double tokenPrice = 10.0;
  bool isLoading = false;

  double get totalAmount {
    final tokens = int.tryParse(_tokensController.text) ?? 0;
    return tokens * tokenPrice;
  }

  Future<void> _sellTokens() async {
    final tokens = int.tryParse(_tokensController.text);

    if (tokens == null || tokens <= 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Please enter valid number of tokens')),
      );
      return;
    }

    if (tokens > widget.availableTokens) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Insufficient tokens. You have ${widget.availableTokens} tokens.')),
      );
      return;
    }

    setState(() => isLoading = true);

    try {
      final response = await _icoService.sellTokens(tokens);

      setState(() => isLoading = false);

      showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: Text('Sell Request Submitted'),
          content: Text(
            'Your sell request for $tokens ICOX tokens has been submitted. '
            'You will receive ₹${totalAmount.toStringAsFixed(2)} once processed by admin.',
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(context); // Close dialog
                Navigator.pop(context); // Go back to dashboard
              },
              child: Text('OK'),
            ),
          ],
        ),
      );
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Sell Tokens')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Available Tokens Display
            Card(
              color: Colors.orange[50],
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    Text('Available Tokens',
                        style: TextStyle(fontSize: 14, color: Colors.grey)),
                    SizedBox(height: 4),
                    Text('${widget.availableTokens} ICOX',
                        style: TextStyle(
                            fontSize: 24, fontWeight: FontWeight.bold)),
                    SizedBox(height: 4),
                    Text('@ ₹${tokenPrice.toStringAsFixed(2)} per token',
                        style: TextStyle(fontSize: 14, color: Colors.grey)),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24),

            // Tokens Input
            TextField(
              controller: _tokensController,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Number of Tokens to Sell',
                hintText: 'Enter tokens',
                border: OutlineInputBorder(),
                suffixText: 'ICOX',
                helperText: 'Max: ${widget.availableTokens} tokens',
              ),
              onChanged: (value) => setState(() {}),
            ),
            SizedBox(height: 16),

            // Total Amount Display
            Card(
              color: Colors.red[50],
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('You will receive:',
                        style: TextStyle(fontSize: 16)),
                    Text('₹${totalAmount.toStringAsFixed(2)}',
                        style: TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Colors.red)),
                  ],
                ),
              ),
            ),
            SizedBox(height: 24),

            // Sell Button
            ElevatedButton(
              onPressed: isLoading ? null : _sellTokens,
              style: ElevatedButton.styleFrom(
                padding: EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.red,
              ),
              child: isLoading
                  ? CircularProgressIndicator(color: Colors.white)
                  : Text('Sell Tokens',
                      style: TextStyle(fontSize: 18, color: Colors.white)),
            ),

            SizedBox(height: 16),

            // Info Card
            Card(
              color: Colors.blue[50],
              child: Padding(
                padding: EdgeInsets.all(12),
                child: Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.blue),
                    SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Sell requests are processed by admin. You will receive payment within 24-48 hours.',
                        style: TextStyle(fontSize: 12, color: Colors.blue[900]),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

---

## 📜 API 5: Get ICO Transaction History

### **Endpoint**

```
GET /ico/transactions
```

### **Request**

```http
GET https://nirv-ico.onrender.com/api/ico/transactions
Content-Type: application/json
Authorization: Bearer {jwt_token}
```

**Authentication Required:** Yes (JWT Token)

### **Response**

```json
[
  {
    "_id": "txn_123",
    "type": "buy",
    "tokens": 50,
    "pricePerToken": 10,
    "totalAmountINR": 500,
    "paymentStatus": "completed",
    "createdAt": "2025-11-29T10:30:00.000Z"
  },
  {
    "_id": "txn_124",
    "type": "sell",
    "tokens": 10,
    "pricePerToken": 10,
    "totalAmountINR": 100,
    "paymentStatus": "pending",
    "createdAt": "2025-11-29T11:00:00.000Z"
  },
  {
    "_id": "txn_125",
    "type": "buy",
    "tokens": 25,
    "pricePerToken": 10,
    "totalAmountINR": 250,
    "paymentStatus": "failed",
    "createdAt": "2025-11-29T12:00:00.000Z"
  }
]
```

### **Transaction Types**

- `buy` - Token purchase
- `sell` - Token sale request

### **Payment Status**

- `pending` - Awaiting payment/processing
- `completed` - Successfully completed
- `failed` - Payment failed

### **Flutter Implementation**

```dart
// Model
class IcoTransaction {
  final String id;
  final String type;
  final int tokens;
  final double pricePerToken;
  final double totalAmountINR;
  final String paymentStatus;
  final DateTime createdAt;

  IcoTransaction({
    required this.id,
    required this.type,
    required this.tokens,
    required this.pricePerToken,
    required this.totalAmountINR,
    required this.paymentStatus,
    required this.createdAt,
  });

  factory IcoTransaction.fromJson(Map<String, dynamic> json) {
    return IcoTransaction(
      id: json['_id'],
      type: json['type'],
      tokens: json['tokens'],
      pricePerToken: (json['pricePerToken'] as num).toDouble(),
      totalAmountINR: (json['totalAmountINR'] as num).toDouble(),
      paymentStatus: json['paymentStatus'],
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}

// Service Method
Future<List<IcoTransaction>> getTransactions() async {
  final token = await StorageService.getToken();
  final response = await _api.get('/ico/transactions', token: token);
  return (response as List)
      .map((json) => IcoTransaction.fromJson(json))
      .toList();
}

// Transaction History Screen
class IcoTransactionHistoryScreen extends StatefulWidget {
  @override
  _IcoTransactionHistoryScreenState createState() =>
      _IcoTransactionHistoryScreenState();
}

class _IcoTransactionHistoryScreenState
    extends State<IcoTransactionHistoryScreen> {
  final IcoService _icoService = IcoService();
  List<IcoTransaction> transactions = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTransactions();
  }

  Future<void> _loadTransactions() async {
    setState(() => isLoading = true);
    try {
      final data = await _icoService.getTransactions();
      setState(() {
        transactions = data;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'completed':
        return Colors.green;
      case 'pending':
        return Colors.orange;
      case 'failed':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _getTypeIcon(String type) {
    return type == 'buy' ? Icons.arrow_downward : Icons.arrow_upward;
  }

  Color _getTypeColor(String type) {
    return type == 'buy' ? Colors.green : Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Transaction History')),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : transactions.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.receipt_long, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('No transactions yet',
                          style: TextStyle(fontSize: 18, color: Colors.grey)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _loadTransactions,
                  child: ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: transactions.length,
                    itemBuilder: (context, index) {
                      final txn = transactions[index];
                      return Card(
                        margin: EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: _getTypeColor(txn.type).withOpacity(0.2),
                            child: Icon(
                              _getTypeIcon(txn.type),
                              color: _getTypeColor(txn.type),
                            ),
                          ),
                          title: Text(
                            '${txn.type.toUpperCase()} ${txn.tokens} ICOX',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              SizedBox(height: 4),
                              Text(
                                '₹${txn.totalAmountINR.toStringAsFixed(2)} @ ₹${txn.pricePerToken.toStringAsFixed(2)}/token',
                              ),
                              SizedBox(height: 4),
                              Text(
                                DateFormat('dd MMM yyyy, hh:mm a')
                                    .format(txn.createdAt),
                                style: TextStyle(fontSize: 12, color: Colors.grey),
                              ),
                            ],
                          ),
                          trailing: Container(
                            padding: EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: _getStatusColor(txn.paymentStatus)
                                  .withOpacity(0.2),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              txn.paymentStatus.toUpperCase(),
                              style: TextStyle(
                                color: _getStatusColor(txn.paymentStatus),
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
```

---

## 🎯 Complete ICO Dashboard Implementation

```dart
class IcoDashboardScreen extends StatefulWidget {
  @override
  _IcoDashboardScreenState createState() => _IcoDashboardScreenState();
}

class _IcoDashboardScreenState extends State<IcoDashboardScreen> {
  final IcoService _icoService = IcoService();

  double tokenPrice = 0.0;
  IcoSummary? summary;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => isLoading = true);
    try {
      final price = await _icoService.getTokenPrice();
      final summaryData = await _icoService.getIcoSummary();

      setState(() {
        tokenPrice = price['priceINR'].toDouble();
        summary = summaryData;
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: ${e.toString()}')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('ICO Dashboard'),
        actions: [
          IconButton(
            icon: Icon(Icons.history),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => IcoTransactionHistoryScreen(),
                ),
              );
            },
          ),
        ],
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                physics: AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Token Price Card
                    Card(
                      color: Colors.blue[50],
                      child: Padding(
                        padding: EdgeInsets.all(16),
                        child: Column(
                          children: [
                            Text('Current Token Price',
                                style: TextStyle(fontSize: 16)),
                            SizedBox(height: 8),
                            Text('ICOX',
                                style: TextStyle(
                                    fontSize: 24, fontWeight: FontWeight.bold)),
                            Text('₹${tokenPrice.toStringAsFixed(2)} per token',
                                style: TextStyle(
                                    fontSize: 20, color: Colors.green)),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(height: 16),

                    // Portfolio Summary
                    if (summary != null) buildPortfolioCard(summary!),
                    SizedBox(height: 24),

                    // Action Buttons
                    Row(
                      children: [
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () async {
                              await Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => BuyTokensScreen(),
                                ),
                              );
                              _loadData(); // Refresh after buy
                            },
                            icon: Icon(Icons.add_circle, color: Colors.white),
                            label: Text('Buy Tokens',
                                style: TextStyle(color: Colors.white)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              padding: EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ),
                        SizedBox(width: 16),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: summary != null && summary!.totalTokens > 0
                                ? () async {
                                    await Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) => SellTokensScreen(
                                          availableTokens: summary!.totalTokens,
                                        ),
                                      ),
                                    );
                                    _loadData(); // Refresh after sell
                                  }
                                : null,
                            icon: Icon(Icons.remove_circle, color: Colors.white),
                            label: Text('Sell Tokens',
                                style: TextStyle(color: Colors.white)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.red,
                              padding: EdgeInsets.symmetric(vertical: 16),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
    );
  }
}
```

---

## 🔐 Authentication & Error Handling

### **Token Management**

```dart
// All ICO APIs require authentication except /ico/price
// Add token to headers:
final token = await StorageService.getToken();
headers: {
  'Authorization': 'Bearer $token',
}

// Handle 401 Unauthorized
if (response.statusCode == 401) {
  await StorageService.clearAll();
  Navigator.pushReplacementNamed(context, '/login');
}
```

### **Error Codes**

- **400**: Validation error (e.g., invalid tokens amount)
- **401**: Unauthorized (token expired/invalid)
- **403**: Forbidden (account not verified)
- **500**: Server error

---

## ✅ Testing Checklist

- [ ] Display current token price
- [ ] Show user holdings and portfolio
- [ ] Calculate profit/loss correctly
- [ ] Buy tokens with PhonePe payment
- [ ] Sell tokens (create sell request)
- [ ] View transaction history
- [ ] Filter transactions by type/status
- [ ] Refresh data (pull-to-refresh)
- [ ] Handle payment success/failure
- [ ] Show loading states
- [ ] Display error messages
- [ ] Validate token amounts

---

## 📦 Required Packages

```yaml
dependencies:
  http: ^1.1.0
  flutter_secure_storage: ^9.0.0
  webview_flutter: ^4.4.2
  intl: ^0.19.0 # For date formatting
```

---

## 🎨 UI Color Scheme

```dart
// Buy/Profit: Green
Colors.green

// Sell/Loss: Red
Colors.red

// Pending: Orange
Colors.orange

// Completed: Green
Colors.green

// Failed: Red
Colors.red
```

---

**This complete guide covers all ICO token operations for your Flutter app! 🚀**
