"""Individual plants - Add my plants collection tables

Revision ID: 002
Revises: 001
Create Date: 2026-02-26

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create individual_plants table
    op.create_table(
        'individual_plants',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('common_name', sa.String(100), nullable=False),
        sa.Column('scientific_name', sa.String(150), nullable=True),
        sa.Column('location', sa.String(100), nullable=True),
        sa.Column('photo_url', sa.String(500), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create care_schedules table
    op.create_table(
        'care_schedules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('care_type', sa.String(20), nullable=False),
        sa.Column('frequency_days', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['plant_id'], ['individual_plants.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create care_events table
    op.create_table(
        'care_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('plant_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('care_type', sa.String(20), nullable=False),
        sa.Column('event_date', sa.DateTime(), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('photo_filename', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['plant_id'], ['individual_plants.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for common queries
    op.create_index('ix_individual_plants_user_id', 'individual_plants', ['user_id'])
    op.create_index('ix_care_schedules_plant_id', 'care_schedules', ['plant_id'])
    op.create_index('ix_care_events_plant_id', 'care_events', ['plant_id'])
    op.create_index('ix_care_events_user_id', 'care_events', ['user_id'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_care_events_user_id', 'care_events')
    op.drop_index('ix_care_events_plant_id', 'care_events')
    op.drop_index('ix_care_schedules_plant_id', 'care_schedules')
    op.drop_index('ix_individual_plants_user_id', 'individual_plants')

    # Drop tables in reverse order
    op.drop_table('care_events')
    op.drop_table('care_schedules')
    op.drop_table('individual_plants')
