#!/bin/bash
# vault-init.sh - Run this script from your host machine

echo "🚀 Setting up Vault for JWT signing..."

# Wait for Vault to be ready
echo "⏳ Waiting for Vault to start..."
sleep 15

echo "🔧 Configuring Vault via HTTP API..."

# Enable transit secrets engine
echo "📦 Enabling transit engine..."
curl -s -X POST -H "X-Vault-Token: dev-token" \
  http://localhost:18200/v1/sys/mounts/transit \
  -d '{"type":"transit"}' || echo "Transit might already be enabled"

echo ""

# Create JWT signing key
echo "🔑 Creating JWT signing key..."
curl -s -X POST -H "X-Vault-Token: dev-token" \
  http://localhost:18200/v1/transit/keys/jwt-key \
  -d '{"type":"rsa-2048"}' || echo "Key might already exist"

echo ""

# Test the setup
echo "🧪 Testing setup..."
TEST_INPUT=$(echo -n "test" | base64)
SIGNATURE=$(curl -s -X POST -H "X-Vault-Token: dev-token" \
  http://localhost:18200/v1/transit/sign/jwt-key/sha2-256 \
  -d "{\"input\":\"$TEST_INPUT\"}" | grep -o '"signature":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$SIGNATURE" ]; then
    echo "✅ Vault JWT setup successful!"
    echo "✅ Test signature: ${SIGNATURE:0:30}..."
else
    echo "❌ Setup failed"
    exit 1
fi

echo ""
echo "🎉 Ready to sign JWTs!"
echo "📋 Usage from your app:"
echo "   POST http://localhost:18200/v1/transit/sign/jwt-key/sha2-256"
echo "   Header: X-Vault-Token: dev-token"
echo "   Body: {\"input\":\"your_base64_jwt_payload\"}"
