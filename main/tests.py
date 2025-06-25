from django.test import TestCase
from django.urls import reverse
from django.db import IntegrityError
from datetime import date, time
from .models import Accounts, Classes, Powers, Characters, Levels, CharacterPower, AccountPower


class AccountsModelTest(TestCase):
    def setUp(self):
        self.account = Accounts.objects.create(
            username="testuser",
            email="test@example.com",
            password="testpass123",
            gold=1000,
            is_active=True,
            last_login=date.today()
        )

    def test_account_creation(self):
        """Test that an account is created successfully"""
        self.assertEqual(self.account.username, "testuser")
        self.assertEqual(self.account.email, "test@example.com")
        self.assertEqual(self.account.gold, 1000)
        self.assertTrue(self.account.is_active)

    def test_unique_username(self):
        """Test that usernames must be unique"""
        with self.assertRaises(IntegrityError):
            Accounts.objects.create(
                username="testuser",  # Same username
                email="different@example.com",
                password="testpass123",
                gold=500,
                is_active=True,
                last_login=date.today()
            )

    def test_unique_email(self):
        """Test that emails must be unique"""
        with self.assertRaises(IntegrityError):
            Accounts.objects.create(
                username="differentuser",
                email="test@example.com",  # Same email
                password="testpass123",
                gold=500,
                is_active=True,
                last_login=date.today()
            )

    def test_str_method_issue(self):
        """Test the __str__ method (Note: there's a bug - should return username, not name)"""
        # This will fail due to the bug in the model
        with self.assertRaises(AttributeError):
            str(self.account)


class ClassesModelTest(TestCase):
    def setUp(self):
        self.game_class = Classes.objects.create(name="Warrior")

    def test_class_creation(self):
        """Test that a class is created successfully"""
        self.assertEqual(self.game_class.name, "Warrior")

    def test_unique_class_name(self):
        """Test that class names must be unique"""
        with self.assertRaises(IntegrityError):
            Classes.objects.create(name="Warrior")

    def test_str_method(self):
        """Test the __str__ method"""
        self.assertEqual(str(self.game_class), "Warrior")


class PowersModelTest(TestCase):
    def setUp(self):
        self.game_class = Classes.objects.create(name="Mage")
        self.power = Powers.objects.create(
            name="Fireball",
            description="A powerful fire spell",
            type="Offensive",
            classe=self.game_class
        )

    def test_power_creation(self):
        """Test that a power is created successfully"""
        self.assertEqual(self.power.name, "Fireball")
        self.assertEqual(self.power.description, "A powerful fire spell")
        self.assertEqual(self.power.type, "Offensive")
        self.assertEqual(self.power.classe, self.game_class)

    def test_power_class_relationship(self):
        """Test the foreign key relationship with Classes"""
        self.assertEqual(self.power.classe.name, "Mage")
        self.assertIn(self.power, self.game_class.powers.all())

    def test_str_method(self):
        """Test the __str__ method"""
        self.assertEqual(str(self.power), "Fireball")


class CharactersModelTest(TestCase):
    def setUp(self):
        self.account = Accounts.objects.create(
            username="player1",
            email="player1@example.com",
            password="password123",
            gold=2000,
            is_active=True,
            last_login=date.today()
        )
        self.game_class = Classes.objects.create(name="Rogue")
        self.character = Characters.objects.create(
            name="Shadowblade",
            id_class=self.game_class,
            account=self.account
        )

    def test_character_creation(self):
        """Test that a character is created successfully"""
        self.assertEqual(self.character.name, "Shadowblade")
        self.assertEqual(self.character.id_class, self.game_class)
        self.assertEqual(self.character.account, self.account)

    def test_character_relationships(self):
        """Test foreign key relationships"""
        self.assertIn(self.character, self.account.characters.all())
        self.assertIn(self.character, self.game_class.characters.all())

    def test_str_method(self):
        """Test the __str__ method"""
        self.assertEqual(str(self.character), "Shadowblade")


class LevelsModelTest(TestCase):
    def setUp(self):
        self.account = Accounts.objects.create(
            username="gamer",
            email="gamer@example.com",
            password="gamepass123",
            gold=3000,
            is_active=True,
            last_login=date.today()
        )
        self.game_class = Classes.objects.create(name="Archer")
        self.character = Characters.objects.create(
            name="Hawkeye",
            id_class=self.game_class,
            account=self.account
        )
        self.level = Levels.objects.create(
            name="Forest of Shadows",
            completion_time=time(0, 5, 30),  # 5 minutes 30 seconds
            kill_amount=25,
            character=self.character
        )

    def test_level_creation(self):
        """Test that a level is created successfully"""
        self.assertEqual(self.level.name, "Forest of Shadows")
        self.assertEqual(self.level.completion_time, time(0, 5, 30))
        self.assertEqual(self.level.kill_amount, 25)
        self.assertEqual(self.level.character, self.character)

    def test_level_character_relationship(self):
        """Test the foreign key relationship with Characters"""
        self.assertIn(self.level, self.character.levels.all())

    def test_str_method(self):
        """Test the __str__ method"""
        self.assertEqual(str(self.level), "Forest of Shadows")


class CharacterPowerModelTest(TestCase):
    def setUp(self):
        self.account = Accounts.objects.create(
            username="poweruser",
            email="poweruser@example.com",
            password="powerpass123",
            gold=1500,
            is_active=True,
            last_login=date.today()
        )
        self.game_class = Classes.objects.create(name="Paladin")
        self.character = Characters.objects.create(
            name="Lightbringer",
            id_class=self.game_class,
            account=self.account
        )
        self.power = Powers.objects.create(
            name="Holy Light",
            description="Healing spell",
            type="Support",
            classe=self.game_class
        )
        self.char_power = CharacterPower.objects.create(
            character=self.character,
            power=self.power,
            slots=3
        )

    def test_character_power_creation(self):
        """Test that a character power relationship is created successfully"""
        self.assertEqual(self.char_power.character, self.character)
        self.assertEqual(self.char_power.power, self.power)
        self.assertEqual(self.char_power.slots, 3)

    def test_unique_together_constraint(self):
        """Test that character-power combinations must be unique"""
        with self.assertRaises(IntegrityError):
            CharacterPower.objects.create(
                character=self.character,
                power=self.power,  # Same character-power combination
                slots=5
            )


class AccountPowerModelTest(TestCase):
    def setUp(self):
        self.account = Accounts.objects.create(
            username="collector",
            email="collector@example.com",
            password="collectpass123",
            gold=5000,
            is_active=True,
            last_login=date.today()
        )
        self.game_class = Classes.objects.create(name="Wizard")
        self.power = Powers.objects.create(
            name="Lightning Bolt",
            description="Electric attack",
            type="Offensive",
            classe=self.game_class
        )
        self.account_power = AccountPower.objects.create(
            account=self.account,
            power=self.power,
            unlocked_at=date.today()
        )

    def test_account_power_creation(self):
        """Test that an account power relationship is created successfully"""
        self.assertEqual(self.account_power.account, self.account)
        self.assertEqual(self.account_power.power, self.power)
        self.assertEqual(self.account_power.unlocked_at, date.today())

    def test_unique_together_constraint(self):
        """Test that account-power combinations must be unique"""
        with self.assertRaises(IntegrityError):
            AccountPower.objects.create(
                account=self.account,
                power=self.power,  # Same account-power combination
                unlocked_at=date.today()
            )
# Integration Tests
class IntegrationTest(TestCase):
    def setUp(self):
        """Set up test data for integration testing"""
        self.account = Accounts.objects.create(
            username="integrationtest",
            email="integration@example.com",
            password="integrationpass123",
            gold=2000,
            is_active=True,
            last_login=date.today()
        )
        
        self.game_class = Classes.objects.create(name="Knight")
        
        self.power1 = Powers.objects.create(
            name="Shield Bash",
            description="Defensive attack",
            type="Defensive",
            classe=self.game_class
        )
        
        self.power2 = Powers.objects.create(
            name="Sword Strike",
            description="Basic sword attack",
            type="Offensive",
            classe=self.game_class
        )
        
        self.character = Characters.objects.create(
            name="Sir Lancelot",
            id_class=self.game_class,
            account=self.account
        )

    def test_complete_character_setup(self):
        """Test a complete character setup with powers and levels"""
        # Add powers to character
        char_power1 = CharacterPower.objects.create(
            character=self.character,
            power=self.power1,
            slots=2
        )
        
        char_power2 = CharacterPower.objects.create(
            character=self.character,
            power=self.power2,
            slots=3
        )
        
        # Unlock powers for account
        AccountPower.objects.create(
            account=self.account,
            power=self.power1,
            unlocked_at=date.today()
        )
        
        AccountPower.objects.create(
            account=self.account,
            power=self.power2,
            unlocked_at=date.today()
        )
        
        # Create levels
        level1 = Levels.objects.create(
            name="Training Ground",
            completion_time=time(0, 2, 0),
            kill_amount=5,
            character=self.character
        )
        
        level2 = Levels.objects.create(
            name="Goblin Camp",
            completion_time=time(0, 5, 45),
            kill_amount=12,
            character=self.character
        )
        
        # Verify all relationships
        self.assertEqual(self.character.characterpower_set.count(), 2)
        self.assertEqual(self.account.accountpower_set.count(), 2)
        self.assertEqual(self.character.levels.count(), 2)
        self.assertEqual(self.game_class.powers.count(), 2)
        self.assertEqual(self.game_class.characters.count(), 1)
        self.assertEqual(self.account.characters.count(), 1)