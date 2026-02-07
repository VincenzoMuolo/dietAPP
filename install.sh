#!/bin/bash

# Script di installazione automatica per DietAPP
# Copia tutti i file nella struttura corretta

echo "🚀 DietAPP - Script di Installazione"
echo "===================================="
echo ""

# Colori per output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funzione per creare directory se non esistono
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        echo -e "${GREEN}✓${NC} Creata directory: $1"
    else
        echo -e "${YELLOW}→${NC} Directory già esistente: $1"
    fi
}

# Funzione per copiare file
copy_file() {
    local source="$1"
    local dest="$2"
    
    if [ -f "$source" ]; then
        cp "$source" "$dest"
        echo -e "${GREEN}✓${NC} Copiato: $dest"
    else
        echo -e "${RED}✗${NC} File non trovato: $source"
        return 1
    fi
}

# Verifica che siamo nella directory corretta
if [ ! -f "package.json" ]; then
    echo -e "${RED}Errore: package.json non trovato!${NC}"
    echo "Assicurati di eseguire questo script dalla root del progetto."
    exit 1
fi

echo "📁 Creazione struttura directory..."
echo ""

# Crea le directory necessarie
create_dir "src"
create_dir "src/components"
create_dir "src/pages"
create_dir "src/utils"
create_dir "public"

echo ""
echo "📋 Copia file componenti..."
echo ""

# Copia componenti
copy_file "Header.jsx" "src/components/Header.jsx"
copy_file "Navigation.jsx" "src/components/Navigation.jsx"
copy_file "CadModal.jsx" "src/components/CadModal.jsx"
copy_file "NotesModal.jsx" "src/components/NotesModal.jsx"

echo ""
echo "📄 Copia file pages..."
echo ""

# Copia pages
copy_file "HomePage.jsx" "src/pages/HomePage.jsx"
copy_file "ShoppingPage.jsx" "src/pages/ShoppingPage.jsx"
copy_file "CadPage.jsx" "src/pages/CadPage.jsx"

echo ""
echo "🔧 Copia file utils..."
echo ""

# Copia utils
copy_file "Utils.jsx" "src/utils/Utils.jsx"

echo ""
echo "🎨 Copia file principali..."
echo ""

# Copia file principali
copy_file "main.jsx" "src/main.jsx"
copy_file "style.css" "src/style.css"

echo ""
echo "✅ Installazione completata!"
echo ""
echo "📝 Prossimi passi:"
echo "   1. Assicurati che i file JSON siano in public/"
echo "   2. Esegui: npm install"
echo "   3. Esegui: npm run dev"
echo ""
echo "📚 Per maggiori informazioni, leggi GUIDA_INSTALLAZIONE.md"
