<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication()
    {
        $app = parent::createApplication();

        // This runs before RefreshDatabase can migrate or truncate anything.
        $connection = $app['config']->get('database.default');
        $database = $app['db']->connection($connection)->getDatabaseName();

        if (! $app->environment('testing') || $database !== 'frame_testing') {
            throw new RuntimeException('Tests may only run in the testing environment against frame_testing. Clear cached configuration and check phpunit.xml.');
        }

        return $app;
    }
}
