[ 🌐 عربي ](README.ar.md) | [ 🇩🇪 Deutsch ](README.de.md) | [ 🇫🇷 Français ](README.fr.md) | [ 🇳🇱 Nederlands ](README.nl.md) | [ 🇪🇸 Español ](README.sp.md) | [ 🇬🇧 English ](README.md)

# Grand livre d'inventaire pour le commerce de détail et la maquila : modèle Excel multi-magasins et traqueur web
### Système de suivi d'inventaire et d'aide à la décision piloté par les événements pour la vente au détail, le commerce électronique et les chaînes d'approvisionnement textile

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Browser%20%2B%20Excel-success)
![Tool](https://img.shields.io/badge/Tool-Inventory%20Decision%20Support-orange)

**Automatise ton suivi des SKU et le rapprochement des stocks d'entrepôt avec ce modèle de gestion des stocks piloté par les événements.** Suis chaque mouvement de stock—de la réception en vrac et de la décomposition de production aux ventes omnicanales et aux transferts d'entrepôt—via un flux de travail unique. Disponible sous forme de tableau de bord de chaîne d'approvisionnement gratuit basé sur navigateur et de traqueur d'inventaire Excel premium téléchargeable. Aucune installation ERP complexe ni inscription à un logiciel cloud requise.

**Aucune inscription. Aucune installation. Prêt à l'emploi dans ton navigateur.**

Teste la logique pilotée par les événements via l'application web gratuite. Pour des opérations commerciales hors ligne continues, passe à la version Excel entièrement personnalisable (avec une garantie de remboursement de 30 jours sans questions).

> 🌐 **Teste la démo en direct**  
> [*Lancer le tableau de bord gratuit de suivi d'inventaire de détail basé sur le web*](https://hyvoid.github.io/Retail-and-Maquila-Inventory-Ledger/)
>
> 📥 **Télécharger la feuille de calcul**  
> [*Télécharger le modèle Excel premium de grand livre d'inventaire pour les opérations multi-magasins*](https://www.theseusworkshop.com/l/zllojx?utm_source=github&utm_medium=GitHub%20README&utm_campaign=readme%20new%20launch&utm_content=multistore-retail-maquila-inventory)

---

## Points de douleur en gestion des stocks et solutions de registre automatisé

Au lieu de concilier manuellement les soldes de stock sur plusieurs feuilles de calcul déconnectées—ce qui entraîne des stocks fantômes et des erreurs d'exécution—ce classeur reconstruit en continu **les positions de stock à partir des événements opérationnels** en temps réel. 

Ce système résout directement les angles morts courants de la chaîne d'approvisionnement en fournissant une visibilité instantanée sur :

- **Disponibilité du stock d'entrepôt :** suis le stock utilisable restant après décomposition de production, transferts internes et gaspillage d'entrepôt enregistré (merma).
- **Suivi de la vente au détail multi-sites :** surveille les niveaux de stock actuels de chaque SKU dans chaque magasin physique ou point de vente (POS) à partir d'un seul tableau de bord consolidé.
- **Coût des marchandises vendues (COGS) et évaluation précis :** lie la valeur de ton stock aux coûts unitaires réels définis dans tes données de base, en remplaçant les soldes financiers estimés.
- **Suivi des pertes et du rétrécissement actionnable :** catégorise les pertes de produits par cause opérationnelle racine, en cartographiant des métriques exactes pour les défauts de production, les dommages de transport et le rétrécissement en magasin de détail.
- **Performance et vélocité des SKU :** compare la performance des ventes en POS aux taux d'épuisement des stocks pour identifier instantanément les gagnants à rotation rapide et le stock mort.
- **Indicateurs prédictifs de santé des stocks :** signale les pénuries de stock de sécurité, les situations de surstock et les exceptions de la chaîne d'approvisionnement avant qu'elles n'affectent ta trésorerie.

---

## À qui cela s'adresse : rôles cibles et cas d'usage de la chaîne d'approvisionnement

Ce classeur est spécialement conçu pour les organisations qui gèrent des stocks entre des entrepôts centralisés et des points de vente décentralisés, en s'appuyant sur des architectures Excel flexibles ou des données opérationnelles CSV exportées plutôt que sur des implémentations ERP d'entreprise rigides et coûteuses.

**Profils d'utilisateurs cibles et scénarios opérationnels :**

- 🛍️ **Responsables de la chaîne d'approvisionnement de la vente au détail ayant besoin d'un modèle des opérations de stock :** pour orchestrer la redistribution stratégique des stocks entre les magasins au lieu d'émettre aveuglément des bons de commande (POs) lorsque le stock d'entrepôt isolé s'épuise.
- 🏭 **Responsables de production textile et maquila ayant besoin d'un outil de décomposition en vrac :** pour suivre parfaitement la conversion de la réception en vrac (palettes/cartons) en SKU individuels vendables (matrice Modèle-Couleur-Taille).
- 📦 **Superviseurs d'entrepôt à la recherche d'une feuille de calcul de comptage cyclique et de rétrécissement :** pour documenter en continu les pertes de produits par cause opérationnelle plutôt que d'attendre le rapprochement physique chaotique de fin de mois.
- 📊 **Analystes des opérations de commerce électronique et omnicanales construisant des KPI :** pour ingérer rapidement des exports CSV POS (Point de vente) ou Shopify dans un tableau de bord de gestion consolidé pour le reporting quotidien.
- 🏪 **Propriétaires de petites et moyennes entreprises (PME) recherchant une alternative ERP légère :** pour gérer le routage des stocks et la rentabilité multi-magasins sans les surcoûts, les coûts de formation et les délais d'intégration des systèmes WMS (Warehouse Management Systems) complets.

*(Remarque : ce classeur n'est **pas** destiné à remplacer des systèmes d'entreprise à haut volume nécessitant un verrouillage transactionnel concurrent en temps réel ou des API de scan de codes-barres actives.)*

---

## Tutoriel de démarrage rapide : automatise ton flux de travail d'inventaire (étape par étape)

Obtenir des informations exploitables sur la chaîne d'approvisionnement ne nécessite que quelques étapes standardisées. Aucune formule complexe n'a besoin d'être modifiée après ta configuration initiale.

### 1. Configure les règles métier (configuration des données de base)
Ouvre la feuille de calcul **Parameters** pour cartographier ton empreinte opérationnelle. Définis ton réseau d'entrepôts et de magasins, personnalise les catégories de gaspillage, importe tes enregistrements de produits de base (SKU) et fixe les coûts unitaires standard. *Action : configure cela une seule fois ; mets à jour uniquement lors de l'ajout de nouvelles gammes de produits ou de nouvelles succursales de vente au détail.*

### 2. Importe les données opérationnelles (ingestion CSV POS et WMS)
Copie les enregistrements transactionnels existants dans les tables d'événements désignées. Colle simplement les données de tes exports ERP, fichiers CSV Shopify/POS, journaux de réception des fournisseurs ou feuilles Excel héritées. *Action : colle les données dans les feuilles de transaction. Aucun recalcul manuel de formule n'est requis.*

### 3. Examine les KPI opérationnels (analyse du tableau de bord)
Navigue directement vers les moteurs d'inventaire ou le tableau de bord de gestion visuel. Le système recalcule automatiquement le stock d'entrepôt, la distribution des SKU multi-magasins, l'évaluation des stocks, les revenus des ventes et l'analyse du gaspillage. *Action : utilise ces informations pour prendre des décisions immédiates de réapprovisionnement ou de transfert.*

### 4. Rafraîchis et répète (cycle de réapprovisionnement continu)
Répète le processus d'importation de données quotidiennement, hebdomadairement ou mensuellement selon ton cycle d'exécution. Aucune reconception de fichiers. Aucune reconstruction de liens cassés. Ajoute simplement de nouveaux événements métier et rafraîchis. 

> 🚀 **Passe à l'action :** Prêt à standardiser tes opérations ? Une fois ta logique métier validée dans l'essai navigateur gratuit, **[télécharge le modèle d'inventaire Excel](https://www.theseusworkshop.com/l/zllojx?utm_source=github&utm_medium=GitHub%20README&utm_campaign=readme%20new%20launch&utm_content=retail-maquila-inventory-ledger)**. Garde-le localement pour construire une base de données hors ligne sécurisée, reproductible et permanente pour ton entreprise.

---

## Le concept central : pourquoi j'ai construit ce cadre piloté par les événements

Beaucoup d'entreprises de vente au détail croient avoir un *problème de stock* systémique alors qu'en réalité, elles souffrent d'un *problème d'architecture de l'information*.

Traditionnellement, les stocks sont maintenus en écrasant directement les soldes. La réception met à jour une feuille de calcul. La production en met à jour une autre. Les directeurs de magasin enregistrent les données de point de vente ailleurs. Finalement, les comptages cycliques cessent de concorder, et l'entreprise passe plus de temps à auditer les écarts de stock qu'à optimiser réellement l'exécution.

**J'ai construit ce classeur autour d'un changement de paradigme : le grand livre d'inventaire piloté par les événements.**

Au lieu de maintenir des soldes statiques, chaque activité physique devient un événement immuable. La réception de marchandises en vrac, le transfert de marchandises, la journalisation des dommages de transport et l'enregistrement des ventes au détail sont consignés indépendamment. Le solde de stock est ensuite **automatiquement reconstruit à partir de ces événements historiques**.

### Le piège du réapprovisionnement multi-magasins (un exemple)
Avant d'utiliser ce cadre, un responsable d'entrepôt pourrait voir qu'**il ne reste que 18 unités du SKU MD-01** dans l'installation centrale et déclencher un PO fournisseur urgent.

En reconstruisant l'historique complet des événements sur l'ensemble du réseau omnicanal, ce modèle révèle la vérité :
- 60 unités ont été transférées vers les magasins régionaux hier.
- 42 unités restent invendues dans les points de vente.
- Le stock de sécurité de l'entrepôt semble bas, mais *le stock à l'échelle de l'entreprise est parfaitement sain*.

**La décision change entièrement :** au lieu de gaspiller de l'argent à fabriquer plus de stock, la direction redistribue le stock de détail existant pour répondre à la demande. Cette logique est universellement applicable, c'est pourquoi ce modèle est structuré comme un actif d'aide à la décision réutilisable.

---

## Comparaison des systèmes : feuilles de calcul manuelles vs. registre piloté par les événements

| Défi typique de la chaîne d'approvisionnement de la vente au détail | Limites de la feuille de calcul manuelle | Solution de registre piloté par les événements |
|---------------------------------------|--------------------------------|------------------------------|
| **Stock fantôme et dérive des soldes** | Les ajustements manuels écrasent définitivement l'historique, rendant impossibles à auditer les écarts de stock historiques. | Chaque mouvement reste traçable comme un événement métier immuable, créant une piste d'audit infaillible. |
| **Algorithmes de réapprovisionnement défectueux** | Les décisions d'achat s'appuient exclusivement sur des soldes d'entrepôt isolés, provoquant un surstock de détail. | L'entrepôt central et les stocks des magasins décentralisés sont évalués globalement avant l'émission des PO. |
| **Détection tardive du rétrécissement** | Le rétrécissement des stocks s'accumule invisiblement jusqu'au redouté comptage cyclique physique de fin de mois.
| **Complexité de mise à l'échelle multi-magasins** | L'ajout de nouveaux points de vente nécessite de créer de nouveaux onglets de feuille de calcul et de lier péniblement des formules fragiles. | Les nouveaux points de vente (POS) se peuplent automatiquement dans la matrice multi-magasins dynamique sans aucune reconception de formule. |
| **Suivi imprécis du COGS et des marges** | Les quantités de stock et les coûts unitaires financiers sont conservés dans des fichiers financiers séparés et non synchronisés. | Les niveaux de stock et les données de coûts standard restent parfaitement verrouillés grâce à des enregistrements de base SKU standardisés. |

---

## Détails techniques

<details>
<summary><strong>Pour les analystes de données, les praticiens d'Excel et les architectes de chaîne d'approvisionnement</strong></summary>

---

### Architecture des données du grand livre

Le modèle impose une séparation stricte entre la saisie des données (entrées) et le calcul des stocks (sorties). 

```text
Parameters & Product Master Data
        │
        ▼
──────────────────────────────────────
Operational Event Data Ingestion
──────────────────────────────────────
Bulk Receiving Log
Production & SKU Breakdown
Shrinkage & Waste (Merma)
Warehouse to Store Transfers
POS Sales & Fulfillment
        │
        ▼
──────────────────────────────────────
Dynamic Calculation Engines
──────────────────────────────────────
Warehouse Inventory Array Engine
Retail Store Matrix Engine
        │
        ▼
──────────────────────────────────────
Management Dashboard UI
──────────────────────────────────────
Automated KPI Cards
Safety Stock & Inventory Health
Omnichannel Sales Performance
Financial Valuation & COGS

```

Les données circulent strictement dans un seul sens : **Configuration → Événements métier → Moteur d'inventaire → Tableau de bord**.

### Référence des formules techniques (moteur Excel)

* **Génération de SKU :** `Model & "-" & Color & "-" & Size` (crée des clés primaires uniques)
* **Récupération des coûts :** `XLOOKUP()` (lie le coût standard aux données transactionnelles)
* **Estimation de la réception :** `Box Qty × Pieces per Box`

* **Listes dynamiques de SKU et de magasins :** utilise `UNIQUE()` et `FILTER()` pour étendre automatiquement la matrice de suivi à mesure que de nouveaux produits ou magasins sont introduits.
* **Matrice de tableau croisé :** utilise `TRANSPOSE()` pour pivoter les magasins contre les SKU.
* **Agrégation d'événements :** utilise une logique `SUMIFS()` robuste pour calculer des combinaisons de `Production - Transferts - Gaspillage - Ventes` à travers des intersections emplacement/SKU spécifiques.

* **Application des clés étrangères :** les SKU, identifiants de magasin et types de gaspillage doivent exister dans les paramètres/données de base, empêchant les erreurs de stock fatales dues aux fautes de frappe.
* **Règles de type de données :** les quantités de transfert et de vente sont limitées à des entiers positifs pour éviter les ruptures de logique mathématique (par exemple, un stock physique négatif).

</details>

---

## La logique métier et la méthodologie

À la base, cet outil abandonne l'habitude traditionnelle de « l'écrasement des soldes » courante dans la gestion des stocks Excel, la remplaçant par des principes de **comptabilité approvisionnée par les événements (Event-Sourced Accounting)**. En traitant les mouvements physiques de la chaîne d'approvisionnement comme des événements de données immuables, le système résout les problèmes métier structurels qui obligent typiquement les entreprises en croissance à passer prématurément à des mises à niveau ERP coûteuses. 

Voici la méthodologie exacte utilisée pour résoudre les défis critiques de l'inventaire de détail et de maquila :

### 1. Méthodologie : reconstruction d'état pilotée par les événements
- **Le problème métier (stock fantôme et échec d'audit) :** lorsque le personnel d'entrepôt écrase manuellement les cellules de feuille de calcul pour mettre à jour le stock actuel, le contexte historique de *pourquoi* le nombre a changé est définitivement détruit. Cela crée des écarts intraçables entre le registre et le comptage physique.
- **La logique :** ce système utilise une architecture en ajout seul. Chaque mouvement physique—réception en vrac, décomposition de production, transfert d'entrepôt ou vente POS—est consigné comme un événement indépendant et immuable. Le solde de stock actuel n'est jamais saisi manuellement ; il est reconstruit dynamiquement en calculant la somme nette de ces événements historiques.
- **Le résultat (100 % d'auditabilité) :** les responsables de la chaîne d'approvisionnement bénéficient d'une piste d'audit infaillible. Si un comptage de stock physique ne correspond pas au système, la direction peut retracer chaque transaction chronologiquement pour localiser la défaillance opérationnelle exacte (par exemple, un journal de transfert manquant ou une vente non enregistrée).

### 2. Méthodologie : matrice d'agrégation des stocks mondial-vers-local
- **Le problème métier (mauvaise allocation du fonds de roulement) :** les responsables des achats émettent souvent de nouveaux bons de commande (PO) simplement parce que l'entrepôt central est vide, ignorant complètement le stock excédentaire inutilisé dans les succursales de vente au détail décentralisées. Cela piège des fonds de roulement précieux dans un surstock inutile.
- **La logique :** le moteur de calcul découple *l'actif de stock* de *l'emplacement de stockage*. Il génère une matrice de tableau croisé en temps réel qui évalue simultanément le stock des magasins locaux (au niveau des nœuds) par rapport au stock mondial de l'entreprise (au niveau du réseau).
- **Le résultat (optimisation omnicanale) :** les équipes opérationnelles peuvent exécuter un rééquilibrage stratégique des stocks. Avant de déployer de l'argent pour fabriquer des marchandises entièrement nouvelles, la direction peut déclencher des transferts latéraux de magasin à magasin ou liquider le stock mort des emplacements à rotation lente.

### 3. Méthodologie : attribution du rétrécissement par cause racine (merma)
- **Le problème métier (érosion invisible des marges) :** la plupart des PME traitent la perte de stock comme un « coût de faire des affaires » générique, ne découvrant l'impact financier que lors du rapprochement de fin de mois, quand il est trop tard pour y remédier.
- **La logique :** le rétrécissement est sorti de l'ombre et enregistré comme des événements opérationnels spécifiques liés directement aux coûts unitaires standard (COGS). Les pertes sont explicitement catégorisées par cause racine : défauts de production (maquila), dommages de transport (logistique) ou vol au détail (opérations en magasin).
- **Le résultat (prévention des pertes actionnable) :** au lieu d'accepter une baisse de marge générique, les contrôleurs financiers peuvent identifier exactement où la valeur fuite. Si un lot de production spécifique produit des défauts élevés, ou si une route de transport spécifique présente des dommages de transport élevés, la direction peut intervenir immédiatement sur la base de données financières quantifiées.

---

## Explore d'autres cadres de chaîne d'approvisionnement et financiers

Si tu as trouvé ce modèle opérationnel précieux, explore mes autres boîtes à outils d'aide à la décision conçues pour les opérateurs et les analystes :

* **Boîte à outils de coûts de main-d'œuvre de fabrication et de planification des capacités** — analyse l'efficacité de la main-d'œuvre, les goulets d'étranglement de capacité de production et les coûts de fabrication unitaires.
* **Console de gouvernance des stocks DTC transfrontalière** — optimise le routage du réapprovisionnement et l'allocation mondiale des stocks à travers les réseaux d'exécution internationaux.
* **Cadre budgétaire unifié personnel et entreprise** — gère la richesse personnelle et la trésorerie des PME dans un modèle financier intégré.
* **Dimensionneur et évaluateur de prêts de transition résidentielle** — évalue les scénarios de prêt immobilier, les structures de capital et les métriques de faisabilité de projet.

Suis mon profil GitHub et visite notre [site web](https://www.theseusworkshop.com/) pour les prochains lancements de produits.

---

## Licence

Ce projet logiciel et la documentation qui l'accompagne sont publiés sous la **licence Apache 2.0**. Tu es libre d'utiliser, de modifier et de distribuer cette boîte à outils conformément aux termes de la licence open-source Apache 2.0.
