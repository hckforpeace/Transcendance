#!/bin/bash

URL="https://localhost:8080/api/ping"  # Mets ici une route valide qui ne nécessite pas de token
TOTAL_REQUESTS=110
SUCCESS=0
TOO_MANY=0

for i in $(seq 1 $TOTAL_REQUESTS); do
  echo -n "Requête $i: "
  response=$(curl -sk -w "%{http_code}" -o /dev/null "$URL")

  if [ "$response" == "429" ]; then
    echo "🛑 Limite atteinte (429)"
    ((TOO_MANY++))
  elif [ "$response" == "200" ]; then
    echo "✅ OK (200)"
    ((SUCCESS++))
  else
    echo "⚠️ Réponse inattendue ($response)"
  fi
done

echo ""
echo "📊 Résumé:"
echo "  ✅ Succès      : $SUCCESS"
echo "  🛑 Bloqués     : $TOO_MANY"
echo "  🔁 Total envoyé: $TOTAL_REQUESTS"