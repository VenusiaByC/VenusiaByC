# Venusia — README

Ce fichier explique où en est le projet et comment le faire avancer, étape par étape. Aucune connaissance technique requise.

## Où on en est (Phase 1, étape 1)

- ✅ Structure du projet posée (Next.js)
- ✅ Système de design connecté aux paramètres : logo, couleurs, polices, textes du hero et coordonnées viennent tous de la base de données, pas du code
- ✅ Page d'accueil qui affiche automatiquement les prestations enregistrées en base
- ✅ Schéma complet de la base de données prêt à être installé (`supabase/schema.sql`)

Ce qui n'est pas encore fait : le moteur de réservation, l'espace admin, les e-mails/SMS. On les construit dans les prochaines étapes.

## Pourquoi tu ne vois pas encore le site "en vrai"

Le site a besoin d'une base de données pour fonctionner (c'est elle qui stockera tes prestations, tes rendez-vous, ton logo...). Cette base n'existe pas encore — il faut la créer une fois, gratuitement, sur Supabase. Une fois que c'est fait, je pourrai te donner un lien où voir et tester le site en conditions réelles.

## Étape à faire de ton côté : créer le compte Supabase (5 minutes, gratuit)

1. Va sur **https://supabase.com**
2. Clique sur **"Start your project"**
3. Crée un compte (avec ton e-mail ou ton compte Google)
4. Clique sur **"New project"**
5. Choisis un nom, par exemple `venusia`
6. Choisis un mot de passe pour la base de données → **note-le précieusement quelque part**, tu en auras besoin plus tard
7. Choisis une région proche de la France (ex : `West EU (Paris)` si disponible, sinon `EU Central`)
8. Clique sur **"Create new project"** et attends 1 à 2 minutes que Supabase le prépare

Une fois le projet créé, reviens me voir avec ces informations (tu les trouveras dans **Project Settings → API** dans le menu de gauche) :
- **Project URL**
- **anon public key**
- **service_role key** (à ne partager qu'avec moi, jamais publiquement)

Je m'en servirai pour connecter le site à ta base et t'envoyer un premier lien fonctionnel.

## Ce que je n'ai pas encore besoin de toi

Pas besoin pour l'instant de : nom de domaine, logo définitif, photos, ou configuration SMTP/Brevo. On les branchera au moment venu. Si tu as déjà ton logo sous la main, tu peux me l'envoyer quand tu veux, ça ne bloque rien.

## Nouveau dans cette étape

- Le moteur de réservation est fonctionnel : `/reserver` propose vraiment les créneaux libres et empêche les doubles réservations
- L'espace `/admin` existe, protégé par connexion, avec un tableau de bord (rendez-vous du jour, à venir, chiffre d'affaires, nombre de clientes)
- Les sections Rendez-vous / Clientes / Prestations / Horaires / etc. sont pour l'instant des pages "à venir" — c'est la prochaine étape

## Étape à faire de ton côté : créer ton compte admin

1. Dans Supabase, menu de gauche → **Authentication** → **Users**
2. Clique sur **"Add user"** → **"Create new user"**
3. Renseigne ton e-mail et un mot de passe (celui que tu utiliseras pour te connecter à `/admin`)
4. Coche **"Auto Confirm User"** si la case existe, puis valide

## Étape suivante : mettre le site en ligne pour pouvoir le tester

Pour que tu puisses vraiment naviguer sur le site (et pas juste lire du code), il faut le déployer. Deux comptes gratuits à créer :

1. **GitHub** (https://github.com) : crée un compte, puis un nouveau "repository" (bouton vert **"New"**), nomme-le `venusia`, laisse-le "Private". Sur la page suivante, utilise le bouton **"uploading an existing file"** pour glisser-déposer tout le contenu du dossier `venusia` de ce zip (sauf `.env.local`, à ne jamais uploader nulle part), puis clique **"Commit changes"**.
2. **Vercel** (https://vercel.com) : crée un compte en te connectant avec GitHub, clique **"Add New" → "Project"**, choisis ton repository `venusia`, puis avant de cliquer sur Deploy, ouvre **"Environment Variables"** et recopie une par une les valeurs de ton fichier `.env.local`. Clique ensuite sur **"Deploy"**.

Une fois déployé, Vercel te donne un lien (`venusia.vercel.app` par exemple) : c'est ton site en ligne, utilisable dès maintenant sur téléphone et ordinateur. Envoie-moi ce lien si tu rencontres une erreur, je t'aiderai à la corriger.

## Nouveau dans cette étape

- Un e-mail de confirmation part automatiquement dès qu'une cliente réserve, depuis TON adresse professionnelle (pas une adresse générique)
- Le contenu de cet e-mail est personnalisable dans **Admin → E-mails**

## Étape à faire de ton côté : renseigner tes identifiants SMTP

Pour que l'envoi fonctionne, j'ai besoin des informations techniques de ton adresse e-mail professionnelle (elles restent uniquement dans les variables d'environnement, jamais dans le code). Ça dépend de qui héberge ton adresse e-mail :

- **Gmail / Google Workspace** : SMTP_HOST = `smtp.gmail.com`, port `587`. Il faudra créer un "mot de passe d'application" (pas ton mot de passe habituel) dans les paramètres de sécurité de ton compte Google.
- **Outlook / Microsoft 365** : SMTP_HOST = `smtp.office365.com`, port `587`.
- **OVH** : SMTP_HOST = `ssl0.ovh.net`, port `587` ou `465`.
- **IONOS** : SMTP_HOST = `smtp.ionos.fr`, port `587`.
- Autre hébergeur : dis-moi lequel, je te donnerai les valeurs exactes.

Dis-moi juste **chez qui est hébergée ton adresse e-mail professionnelle** et je te guide précisément pour récupérer les 4 informations nécessaires (serveur, port, identifiant, mot de passe) et les ajouter dans Vercel.

## Structure du projet (pour référence)

```
app/                 Pages du site (accueil, puis réservation, admin...)
components/          Composants réutilisables (ex: Logo)
lib/settings.ts       Charge tous les réglages personnalisables depuis la base
lib/supabase/         Connexion à la base de données
supabase/schema.sql   Structure complète de la base de données à installer
.env.example          Modèle des informations secrètes à renseigner
```
