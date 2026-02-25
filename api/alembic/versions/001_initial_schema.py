"""Initial schema - Create all tables

Revision ID: 001
Revises:
Create Date: 2026-02-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ENUM types
    event_type_enum = postgresql.ENUM(
        'SEEDED', 'GERMINATED', 'TRANSPLANTED', 'FIRST_FLOWER',
        'MATURE', 'HARVESTED', 'GIVEN_AWAY', 'TRADED', 'DIED', 'OBSERVATION',
        name='eventtype'
    )
    event_type_enum.create(op.get_bind(), checkfirst=True)

    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('display_color', sa.String(7), nullable=True),
        sa.Column('pin_hash', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create seasons table
    op.create_table(
        'seasons',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('year')
    )

    # Create plant_varieties table
    op.create_table(
        'plant_varieties',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('common_name', sa.String(100), nullable=False),
        sa.Column('scientific_name', sa.String(150), nullable=True),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('flowering_season', sa.String(50), nullable=True),
        sa.Column('days_to_germinate', sa.Integer(), nullable=True),
        sa.Column('days_to_mature', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    # Create plant_batches table
    op.create_table(
        'plant_batches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('variety_id', sa.Integer(), nullable=False),
        sa.Column('season_id', sa.Integer(), nullable=False),
        sa.Column('seeds_count', sa.Integer(), nullable=True),
        sa.Column('packets', sa.Integer(), nullable=True),
        sa.Column('source', sa.String(100), nullable=True),
        sa.Column('location', sa.String(100), nullable=True),
        sa.Column('start_date', sa.DateTime(), nullable=True),
        sa.Column('transplant_date', sa.DateTime(), nullable=True),
        sa.Column('repeat_next_year', sa.String(10), nullable=True),
        sa.Column('outcome_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['variety_id'], ['plant_varieties.id']),
        sa.ForeignKeyConstraint(['season_id'], ['seasons.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create events table
    op.create_table(
        'events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('batch_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('event_type', event_type_enum, nullable=False),
        sa.Column('event_date', sa.DateTime(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['batch_id'], ['plant_batches.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create photos table
    op.create_table(
        'photos',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('batch_id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(255), nullable=False),
        sa.Column('caption', sa.Text(), nullable=True),
        sa.Column('taken_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['batch_id'], ['plant_batches.id']),
        sa.ForeignKeyConstraint(['event_id'], ['events.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('filename')
    )

    # Create distributions table
    op.create_table(
        'distributions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('batch_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('recipient', sa.String(100), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=True),
        sa.Column('type', sa.String(20), nullable=False),
        sa.Column('date', sa.DateTime(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['batch_id'], ['plant_batches.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create season_costs table
    op.create_table(
        'season_costs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('season_id', sa.Integer(), nullable=False),
        sa.Column('item_name', sa.String(100), nullable=False),
        sa.Column('cost', sa.Numeric(10, 2), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=True),
        sa.Column('category', sa.String(50), nullable=False),
        sa.Column('is_one_time', sa.Boolean(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['season_id'], ['seasons.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for common queries
    op.create_index('ix_plant_batches_season_id', 'plant_batches', ['season_id'])
    op.create_index('ix_plant_batches_variety_id', 'plant_batches', ['variety_id'])
    op.create_index('ix_plant_batches_user_id', 'plant_batches', ['user_id'])
    op.create_index('ix_events_batch_id', 'events', ['batch_id'])
    op.create_index('ix_events_user_id', 'events', ['user_id'])
    op.create_index('ix_photos_batch_id', 'photos', ['batch_id'])
    op.create_index('ix_season_costs_season_id', 'season_costs', ['season_id'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_season_costs_season_id', 'season_costs')
    op.drop_index('ix_photos_batch_id', 'photos')
    op.drop_index('ix_events_user_id', 'events')
    op.drop_index('ix_events_batch_id', 'events')
    op.drop_index('ix_plant_batches_user_id', 'plant_batches')
    op.drop_index('ix_plant_batches_variety_id', 'plant_batches')
    op.drop_index('ix_plant_batches_season_id', 'plant_batches')

    # Drop tables in reverse order
    op.drop_table('season_costs')
    op.drop_table('distributions')
    op.drop_table('photos')
    op.drop_table('events')
    op.drop_table('plant_batches')
    op.drop_table('plant_varieties')
    op.drop_table('seasons')
    op.drop_table('users')

    # Drop enum type
    op.execute('DROP TYPE IF EXISTS eventtype')
