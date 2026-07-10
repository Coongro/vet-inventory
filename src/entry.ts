/**
 * @coongro/vet-inventory — Plugin lifecycle entry point
 *
 * activate() se invoca cuando el plugin se carga en un tenant.
 * Usar para seeds, listeners, o inicialización one-time.
 */

import type { ModuleActivationContext } from '@coongro/plugin-sdk';

export async function activate({ api }: ModuleActivationContext): Promise<void> {
  api.logger.info('Plugin activated');
}
