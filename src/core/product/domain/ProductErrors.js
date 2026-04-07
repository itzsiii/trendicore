import { DomainError } from '../../shared/domain/DomainError';

export class DuplicateProductError extends DomainError {
  constructor(productName) {
    super(`El producto "${productName || 'existente'}" ya se encuentra registrado en el sistema. Trata de utilizar un título distinto.`);
  }
}

export class ProductNotFoundError extends DomainError {
  constructor(productId) {
    super(`El producto solicitado no fue encontrado en la base de datos de Trendicore (ID: ${productId || 'desconocido'}).`);
  }
}

export class InvalidProductDataError extends DomainError {
  constructor(reason) {
    super(`Datos de producto irreconocibles o inválidos: ${reason}`);
  }
}
