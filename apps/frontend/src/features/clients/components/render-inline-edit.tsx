// src/features/clients/components/render-inline-edit.tsx

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Client } from "../types";

export const RenderInlineEdit = (
  client: Client,
  onSave: () => void,
  onCancel: () => void,
) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          placeholder="Nombre del cliente"
          value={client.name}
          onChange={(e) => console.log(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contactPerson">Persona de contacto</Label>
        <Input
          id="contactPerson"
          placeholder="Nombre de la persona de contacto"
          value={client.contactPerson}
          onChange={(e) => console.log(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          placeholder="Correo electrónico del cliente"
          value={client.email}
          onChange={(e) => console.log(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          placeholder="Número de teléfono del cliente"
          value={client.phone}
          onChange={(e) => console.log(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">Estado</Label>
        <Select
          defaultValue={client.status}
          onValueChange={(value) => console.log(value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Activo</SelectItem>
            <SelectItem value="inactive">Inactivo</SelectItem>
            <SelectItem value="prospect">Prospecto</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="totalOrders">Total de pedidos</Label>
        <Input
          id="totalOrders"
          placeholder="Número total de pedidos"
          value={client.totalOrders}
          onChange={(e) => console.log(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="totalRevenue">Ingresos totales</Label>
        <Input
          id="totalRevenue"
          placeholder="Cantidad total de ingresos"
          value={client.totalRevenue}
          onChange={(e) => console.log(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastOrder">Último pedido</Label>
        <Input
          id="lastOrder"
          placeholder="Fecha del último pedido"
          value={client.lastOrder}
          onChange={(e) => console.log(e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onCancel}>Cancelar</button>
        <button onClick={onSave}>Guardar</button>
      </div>
    </>
  );
};
