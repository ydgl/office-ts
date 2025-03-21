
const modalites= ["MODALITE_A_DISTANCE_WEBCONF", "MODALITE_PRESENTIEL_FACE_A_FACE"] ;

type Modalites= (typeof modalites)[number];

interface Plage {
modalite: Modalite;
...
}