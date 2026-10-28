# Kalubimba Family - Application Web Laravel

Application web de gestion familiale pour la famille Kalubimba.

## 🚀 Installation Rapide

### Étape 1: Installer Composer

1. Téléchargez Composer: https://getcomposer.org/Composer-Setup.exe
2. Installez-le
3. Redémarrez PowerShell

### Étape 2: Installer les dépendances Laravel

```bash
composer install
```

### Étape 3: Générer la clé d'application

```bash
php artisan key:generate
```

### Étape 4: Créer le lien de stockage

```bash
php artisan storage:link
```

### Étape 5: Lancer l'application

```bash
php artisan serve
```

Puis ouvrez: **http://localhost:8000**

## 📦 Base de Données

La base de données MySQL `kalubimba_family` existe déjà avec:
- Table `users` (utilisateurs)
- Table `members` (membres de la famille)
- Table `photos` (photos familiales)
- Table `videos` (vidéos familiales)
- Table `messages` (chat familial)

Admin:
- Email: adminkalubimba@gmail.com
- Mot de passe: kalubimba1234

## 🛠️ Technologies

- Laravel 10.x
- PHP 8.1+
- MySQL 8.0+
- Bootstrap 5.3
- Blade Templates

## 📱 Fonctionnalités

- ✅ Authentification sécurisée
- ✅ Gestion des membres de la famille
- ✅ Arbre généalogique interactif
- ✅ Album photos
- ✅ Galerie vidéos
- ✅ Chat familial
- ✅ Section mémorial
- ✅ Responsive (mobile, tablette, desktop)

## 📝 Documentation

Consultez le fichier `GUIDE_INSTALLATION_COMPOSER.md` pour plus de détails.
