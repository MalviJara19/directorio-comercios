export interface Comercio {
  id: string;
  nombre: string;
  rubro: string;
  direccion: string;
  promedioEstrellas: number;
  totalResenas: number;
}

export const comerciosMock: Comercio[] = [
  {
    id: '1',
    nombre: 'Almacén Don Jose',
    rubro: 'almacen',
    direccion: 'Belgrano 456',
    promedioEstrellas: 4.8,
    totalResenas: 24,
  },
  {
    id: '2',
    nombre: 'Verdulería La Estación',
    rubro: 'verdulerica',
    direccion: 'Rivadavia 789',
    promedioEstrellas: 4.5,
    totalResenas: 15,
  },
  {
    id: '3',
    nombre: 'Panadería El Sol',
    rubro: 'panaderia',
    direccion: 'San Martín 321',
    promedioEstrellas: 4.9,
    totalResenas: 40,
  },
];