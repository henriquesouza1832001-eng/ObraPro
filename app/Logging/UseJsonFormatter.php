<?php

namespace App\Logging;

use Illuminate\Log\Logger;
use Monolog\Formatter\JsonFormatter;

class UseJsonFormatter
{
    public function __invoke(Logger $logger): void
    {
        foreach ($logger->getLogger()->getHandlers() as $handler) {
            $handler->setFormatter(new JsonFormatter(JsonFormatter::BATCH_MODE_JSON, true));
        }
    }
}
