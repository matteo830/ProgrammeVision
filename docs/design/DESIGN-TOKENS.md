# Vision — Design Tokens

> Source de vérité des couleurs, typo et constantes de design pour Programme Vision.
> À traduire en variables Tailwind v4 / CSS custom properties dans le vrai projet.
> Ces valeurs sont déjà utilisées telles quelles dans les composants (objet `C` en haut de chaque fichier).

## Couleurs

### Vert sapin (couleur primaire, issue du logo)
| Token | Hex | Usage |
|---|---|---|
| `greenDeep` | `#0E3D34` | Fond des hero, avatars, boutons sombres |
| `greenDeeper` | `#07251F` | Dégradé bas des hero (`linear-gradient(160deg, greenDeep, greenDeeper)`) |
| `greenMid` | `#1A5448` | Vert intermédiaire |
| `greenAccent` | `#3FA88E` | Turquoise — succès, points "terminé", deltas positifs |
| `greenSoft` | `#E8EFEC` | Fonds de badges/pills verts |
| `greenLight` | `#D7E5DE` | Bordures vertes douces |

### Or (accent, issu du logo)
| Token | Hex | Usage |
|---|---|---|
| `goldDeep` | `#B8862E` | Texte or sur fond clair |
| `gold` | `#D4A047` | Or principal — accents, avatars sur fond sombre |
| `goldLight` | `#E8C56F` | Or clair — eyebrows sur hero sombres |
| `goldSoft` | `#FBF1D8` | Fonds de badges or |

### Corail (couleur signature des CTA — validée par le client)
| Token | Hex | Usage |
|---|---|---|
| `coralStart` | `#FF8A6B` | Début du dégradé CTA |
| `coralMid` | `#F46B7A` | Milieu (optionnel) |
| `coralEnd` | `#E8527D` | Fin du dégradé CTA, accents "à faire"/actuel |

> **CTA principal** = `linear-gradient(135deg, #FF8A6B, #E8527D)`, texte blanc, border-radius 12-14px, font-weight 700.

### Neutres
| Token | Hex | Usage |
|---|---|---|
| `cream` | `#FAF6EB` | Fond d'écran principal |
| `creamWarm` | `#F2EBD8` | Fond secondaire / zones |
| `ink` | `#1A1714` | Texte principal |
| `inkSoft` | `#5A5247` | Texte secondaire |
| `inkMute` | `#9A9080` | Texte tertiaire / placeholders |
| `border` | `#E8DFC8` | Bordures cartes |
| `borderSoft` | `#F0E8D4` | Bordures internes / séparateurs |
| `white` | `#FFFFFF` | Cartes |

### Tuiles colorées (dashboard, victoires)
| Token | Fond | Texte |
|---|---|---|
| Mauve | `#D8C7E5` | `#5D3F7A` |
| Rose | `#F5C9CE` | `#A8425C` |
| Pêche | `#F5D5B0` | `#A6611F` |
| Bleu | `#C2D5E5` | `#3A5E80` |
| Sauge | `#CFDDC2` | `#4A6638` |
| Ciel | `#D2E0E8` | `#3D5C70` |

## Typographie
- **Police** : Inter (400, 500, 600, 700, 800)
- Titres hero : 25-26px / 800 / letter-spacing -0.02em
- Titres section : 16-19px / 700-800
- Corps : 13-14px / 400-500 / line-height 1.5-1.6
- Labels/eyebrows : 10-11px / 700 / letter-spacing 0.08-0.14em / UPPERCASE
- Tabular-nums sur tous les chiffres/stats

## Formes & espacements
- Border-radius : cartes 16-20px · hero 20px · boutons 12-14px · pills 999px · petits éléments 8-11px
- Padding cartes : 14-18px
- Gap entre cartes : 8-12px
- Largeur max contenu mobile : 640px, centré, padding latéral 16px
- Hero : ombre portée corail sur CTA `0 10px 24px -10px {coralEnd}80`

## Motifs récurrents
- **Montagne SVG** : décoration en bas à droite des hero verts (opacity 0.25, polygones blancs). Symbole du "sommet/objectif".
- **Hero vert** : `linear-gradient(160deg, #0E3D34, #07251F)` + eyebrow or + titre blanc + montagne.
- **Statut activité** : pastille verte (actif) / or (attention) / rouge (inactif).
- **Hiérarchie coach/client** : or = parole du coach, corail = parole du client.
