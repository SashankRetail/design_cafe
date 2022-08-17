enum RoomTypesEnum {
  KITCHEN = "kitchen",
  UTILITY = "Utility",
  KBR = "kbr",
  MBR = "mbr",
  PBR = "pbr",
  PARENTS_BEDROOM = "parent's bedroom",
  FOYER = "foyer",
  POOJA = "pooja",
  POOJA_ROOM = "pooja room",
  DINING = "dining room",
  MASTER = "master",
  MASTER_BEDROOM = "master bedroom",
  ROOM1 = "room 1",
  CBR = "cbr",
  CHILDREN_ROOM = "children's bedroom",
  KIDS_ROOM = "kids bedroom",
  ROOM2 = "room 2",
  GBR = "gbr",
  GUEST_BEDROOM = "guest bedroom",
  GUEST_ROOM = "guest room",
  ROOM3 = "room 3",
  BDR4 = "bdr4",
  BEDROOM4 = "bedroom 4",
  ROOM4 = "room 4",
  LIVING_DINING = "living dining",
  LIVING = "living",
  LIVING_N_DINING = "living & dining",
  LIVING_AND_DINING = "living and dining",
  SITE_SERVISES = "site services",
  CIVIL = "civil",
  CIVIL_SERVICES = "civil services",
  CIVIL_WORK = "civil work",
  SITE_WORK = "site work",
}

const SITE_SERVICE = [
  RoomTypesEnum.SITE_SERVISES,
  RoomTypesEnum.SITE_WORK,
  RoomTypesEnum.CIVIL,
  RoomTypesEnum.CIVIL_SERVICES,
  RoomTypesEnum.CIVIL_WORK,
];

export {
  SITE_SERVICE,
};
export default RoomTypesEnum;
