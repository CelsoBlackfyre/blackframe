SELECT 'CREATE DATABASE frame_testing'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'frame_testing')
\gexec
